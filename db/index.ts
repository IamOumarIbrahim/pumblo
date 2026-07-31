import { env } from "cloudflare:workers";
import { COMMUNITY_ORDER_SQL } from "@/app/lib/community-ranking";

export const MAX_VIDEO_BYTES = 90 * 1024 * 1024;

type RuntimeBindings = {
  DB: D1Database;
  MEDIA: R2Bucket;
};

export type Profile = {
  email: string;
  handle: string;
  displayName: string;
  bio: string;
  location: string;
  website: string;
  avatarColor: string;
  createdAt: string;
  updatedAt: string;
};

export type Video = {
  id: string;
  ownerEmail: string;
  title: string;
  description: string;
  generationTool: string;
  generationMode: string;
  category: string;
  license: string;
  prompt: string;
  objectKey: string;
  contentType: string;
  sizeBytes: number;
  provenanceStatus: string;
  views: number;
  createdAt: string;
  ownerHandle: string;
  ownerDisplayName: string;
  ownerAvatarColor: string;
  likeCount: number;
  commentCount: number;
};

export type Comment = {
  id: string;
  videoId: string;
  content: string;
  createdAt: string;
  authorHandle: string;
  authorDisplayName: string;
  authorAvatarColor: string;
};

function bindings(): RuntimeBindings {
  return env as unknown as RuntimeBindings;
}

let schemaReady: Promise<void> | undefined;

export async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = initializeSchema().catch((error) => {
      schemaReady = undefined;
      throw error;
    });
  }
  return schemaReady;
}

async function initializeSchema(): Promise<void> {
  const db = bindings().DB;
  await db.batch([
    db.prepare(`
      CREATE TABLE IF NOT EXISTS profiles (
        email TEXT PRIMARY KEY,
        handle TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        bio TEXT NOT NULL DEFAULT '',
        location TEXT NOT NULL DEFAULT '',
        website TEXT NOT NULL DEFAULT '',
        avatar_color TEXT NOT NULL DEFAULT '#b8ff3d',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS videos (
        id TEXT PRIMARY KEY,
        owner_email TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        generation_tool TEXT NOT NULL,
        generation_mode TEXT NOT NULL,
        category TEXT NOT NULL,
        license TEXT NOT NULL,
        prompt TEXT NOT NULL DEFAULT '',
        object_key TEXT NOT NULL UNIQUE,
        content_type TEXT NOT NULL,
        size_bytes INTEGER NOT NULL,
        provenance_status TEXT NOT NULL,
        sqs_score INTEGER NOT NULL,
        views INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (owner_email) REFERENCES profiles(email)
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS likes (
        video_id TEXT NOT NULL,
        user_email TEXT NOT NULL,
        created_at TEXT NOT NULL,
        PRIMARY KEY (video_id, user_email),
        FOREIGN KEY (video_id) REFERENCES videos(id),
        FOREIGN KEY (user_email) REFERENCES profiles(email)
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        video_id TEXT NOT NULL,
        author_email TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (video_id) REFERENCES videos(id),
        FOREIGN KEY (author_email) REFERENCES profiles(email)
      )
    `),
    db.prepare("CREATE INDEX IF NOT EXISTS videos_owner_idx ON videos(owner_email)"),
    db.prepare("CREATE INDEX IF NOT EXISTS videos_created_idx ON videos(created_at DESC)"),
    db.prepare("CREATE INDEX IF NOT EXISTS likes_video_idx ON likes(video_id)"),
    db.prepare("CREATE INDEX IF NOT EXISTS comments_video_idx ON comments(video_id, created_at DESC)"),
  ]);
}

export function mediaBucket(): R2Bucket {
  return bindings().MEDIA;
}

export async function getProfileByEmail(
  email: string,
): Promise<Profile | null> {
  await ensureSchema();
  return (
    (await bindings()
      .DB.prepare(
        `SELECT
          email,
          handle,
          display_name AS displayName,
          bio,
          location,
          website,
          avatar_color AS avatarColor,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM profiles
        WHERE email = ?1`,
      )
      .bind(email.toLowerCase())
      .first<Profile>()) ?? null
  );
}

export async function getProfileByHandle(
  handle: string,
): Promise<Profile | null> {
  await ensureSchema();
  return (
    (await bindings()
      .DB.prepare(
        `SELECT
          email,
          handle,
          display_name AS displayName,
          bio,
          location,
          website,
          avatar_color AS avatarColor,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM profiles
        WHERE handle = ?1`,
      )
      .bind(handle.toLowerCase())
      .first<Profile>()) ?? null
  );
}

export async function saveProfile(input: {
  email: string;
  handle: string;
  displayName: string;
  bio: string;
  location: string;
  website: string;
  avatarColor: string;
}): Promise<Profile> {
  await ensureSchema();
  const db = bindings().DB;
  const email = input.email.toLowerCase();
  const existing = await getProfileByEmail(email);

  const collision = await db
    .prepare("SELECT email FROM profiles WHERE handle = ?1 AND email <> ?2")
    .bind(input.handle, email)
    .first<{ email: string }>();
  if (collision) throw new Error("That handle is already taken.");

  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO profiles (
        email, handle, display_name, bio, location, website, avatar_color,
        created_at, updated_at
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?8)
      ON CONFLICT(email) DO UPDATE SET
        handle = excluded.handle,
        display_name = excluded.display_name,
        bio = excluded.bio,
        location = excluded.location,
        website = excluded.website,
        avatar_color = excluded.avatar_color,
        updated_at = excluded.updated_at`,
    )
    .bind(
      email,
      input.handle,
      input.displayName,
      input.bio,
      input.location,
      input.website,
      input.avatarColor,
      existing?.createdAt ?? now,
    )
    .run();

  return (await getProfileByEmail(email))!;
}

const videoSelect = `
  SELECT
    v.id,
    v.owner_email AS ownerEmail,
    v.title,
    v.description,
    v.generation_tool AS generationTool,
    v.generation_mode AS generationMode,
    v.category,
    v.license,
    v.prompt,
    v.object_key AS objectKey,
    v.content_type AS contentType,
    v.size_bytes AS sizeBytes,
    v.provenance_status AS provenanceStatus,
    v.views,
    v.created_at AS createdAt,
    p.handle AS ownerHandle,
    p.display_name AS ownerDisplayName,
    p.avatar_color AS ownerAvatarColor,
    (SELECT COUNT(*) FROM likes l WHERE l.video_id = v.id) AS likeCount,
    (SELECT COUNT(*) FROM comments c WHERE c.video_id = v.id) AS commentCount
  FROM videos v
  JOIN profiles p ON p.email = v.owner_email
`;

export async function listVideos(options?: {
  ownerEmail?: string;
  query?: string;
  category?: string;
  sort?: "newest" | "community";
  limit?: number;
}): Promise<Video[]> {
  await ensureSchema();
  const clauses: string[] = [];
  const values: unknown[] = [];

  if (options?.ownerEmail) {
    clauses.push(`v.owner_email = ?${values.length + 1}`);
    values.push(options.ownerEmail.toLowerCase());
  }
  if (options?.query) {
    clauses.push(
      `(LOWER(v.title) LIKE ?${values.length + 1} OR LOWER(v.description) LIKE ?${values.length + 1} OR LOWER(v.generation_tool) LIKE ?${values.length + 1})`,
    );
    values.push(`%${options.query.toLowerCase()}%`);
  }
  if (options?.category && options.category !== "all") {
    clauses.push(`v.category = ?${values.length + 1}`);
    values.push(options.category);
  }

  const order =
    options?.sort === "newest" ? "v.created_at DESC" : COMMUNITY_ORDER_SQL;
  values.push(Math.min(options?.limit ?? 48, 100));
  const sql = `${videoSelect}
    ${clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""}
    ORDER BY ${order}
    LIMIT ?${values.length}`;

  const result = await bindings().DB.prepare(sql).bind(...values).all<Video>();
  return result.results;
}

export async function getVideo(id: string): Promise<Video | null> {
  await ensureSchema();
  return (
    (await bindings()
      .DB.prepare(`${videoSelect} WHERE v.id = ?1`)
      .bind(id)
      .first<Video>()) ?? null
  );
}

export async function createVideo(input: {
  id: string;
  ownerEmail: string;
  title: string;
  description: string;
  generationTool: string;
  generationMode: string;
  category: string;
  license: string;
  prompt: string;
  objectKey: string;
  contentType: string;
  sizeBytes: number;
  provenanceStatus: string;
}): Promise<Video> {
  await ensureSchema();
  await bindings()
    .DB.prepare(
      `INSERT INTO videos (
        id, owner_email, title, description, generation_tool, generation_mode,
        category, license, prompt, object_key, content_type, size_bytes,
        provenance_status, sqs_score, views, created_at
      ) VALUES (
        ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, 0, 0, ?14
      )`,
    )
    .bind(
      input.id,
      input.ownerEmail.toLowerCase(),
      input.title,
      input.description,
      input.generationTool,
      input.generationMode,
      input.category,
      input.license,
      input.prompt,
      input.objectKey,
      input.contentType,
      input.sizeBytes,
      input.provenanceStatus,
      new Date().toISOString(),
    )
    .run();

  return (await getVideo(input.id))!;
}

export async function incrementViews(id: string): Promise<void> {
  await ensureSchema();
  await bindings()
    .DB.prepare("UPDATE videos SET views = views + 1 WHERE id = ?1")
    .bind(id)
    .run();
}

export async function listComments(videoId: string): Promise<Comment[]> {
  await ensureSchema();
  const result = await bindings()
    .DB.prepare(
      `SELECT
        c.id,
        c.video_id AS videoId,
        c.content,
        c.created_at AS createdAt,
        p.handle AS authorHandle,
        p.display_name AS authorDisplayName,
        p.avatar_color AS authorAvatarColor
      FROM comments c
      JOIN profiles p ON p.email = c.author_email
      WHERE c.video_id = ?1
      ORDER BY c.created_at DESC
      LIMIT 100`,
    )
    .bind(videoId)
    .all<Comment>();
  return result.results;
}

export async function addComment(
  videoId: string,
  authorEmail: string,
  content: string,
): Promise<Comment> {
  await ensureSchema();
  const id = crypto.randomUUID();
  await bindings()
    .DB.prepare(
      `INSERT INTO comments (id, video_id, author_email, content, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5)`,
    )
    .bind(
      id,
      videoId,
      authorEmail.toLowerCase(),
      content,
      new Date().toISOString(),
    )
    .run();
  const comments = await listComments(videoId);
  return comments.find((comment) => comment.id === id)!;
}

export async function getLikeState(
  videoId: string,
  email: string,
): Promise<boolean> {
  await ensureSchema();
  const row = await bindings()
    .DB.prepare(
      "SELECT 1 AS liked FROM likes WHERE video_id = ?1 AND user_email = ?2",
    )
    .bind(videoId, email.toLowerCase())
    .first<{ liked: number }>();
  return Boolean(row);
}

export async function toggleLike(
  videoId: string,
  email: string,
): Promise<{ liked: boolean; count: number }> {
  await ensureSchema();
  const db = bindings().DB;
  const normalizedEmail = email.toLowerCase();
  const liked = await getLikeState(videoId, normalizedEmail);

  if (liked) {
    await db
      .prepare("DELETE FROM likes WHERE video_id = ?1 AND user_email = ?2")
      .bind(videoId, normalizedEmail)
      .run();
  } else {
    await db
      .prepare(
        `INSERT OR IGNORE INTO likes (video_id, user_email, created_at)
         VALUES (?1, ?2, ?3)`,
      )
      .bind(videoId, normalizedEmail, new Date().toISOString())
      .run();
  }

  const result = await db
    .prepare("SELECT COUNT(*) AS count FROM likes WHERE video_id = ?1")
    .bind(videoId)
    .first<{ count: number }>();
  return { liked: !liked, count: result?.count ?? 0 };
}
