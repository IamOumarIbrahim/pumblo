import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable(
  "profiles",
  {
    email: text("email").primaryKey(),
    handle: text("handle").notNull(),
    displayName: text("display_name").notNull(),
    bio: text("bio").notNull().default(""),
    location: text("location").notNull().default(""),
    website: text("website").notNull().default(""),
    avatarColor: text("avatar_color").notNull().default("#b8ff3d"),
    avatarObjectKey: text("avatar_object_key").notNull().default(""),
    bannerObjectKey: text("banner_object_key").notNull().default(""),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [uniqueIndex("profiles_handle_unique").on(table.handle)],
);

export const videos = sqliteTable(
  "videos",
  {
    id: text("id").primaryKey(),
    ownerEmail: text("owner_email")
      .notNull()
      .references(() => profiles.email),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    generationTool: text("generation_tool").notNull(),
    generationMode: text("generation_mode").notNull(),
    category: text("category").notNull(),
    license: text("license").notNull(),
    prompt: text("prompt").notNull().default(""),
    objectKey: text("object_key").notNull(),
    contentType: text("content_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    durationSeconds: real("duration_seconds").notNull().default(0),
    provenanceStatus: text("provenance_status").notNull(),
    sqsScore: integer("sqs_score").notNull(),
    views: integer("views").notNull().default(0),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("videos_owner_idx").on(table.ownerEmail),
    index("videos_created_idx").on(table.createdAt),
    uniqueIndex("videos_object_key_unique").on(table.objectKey),
  ],
);

export const likes = sqliteTable(
  "likes",
  {
    videoId: text("video_id")
      .notNull()
      .references(() => videos.id),
    userEmail: text("user_email")
      .notNull()
      .references(() => profiles.email),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.videoId, table.userEmail] }),
    index("likes_video_idx").on(table.videoId),
  ],
);

export const comments = sqliteTable(
  "comments",
  {
    id: text("id").primaryKey(),
    videoId: text("video_id")
      .notNull()
      .references(() => videos.id),
    authorEmail: text("author_email")
      .notNull()
      .references(() => profiles.email),
    content: text("content").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("comments_video_idx").on(table.videoId, table.createdAt),
  ],
);

export const follows = sqliteTable(
  "follows",
  {
    creatorEmail: text("creator_email")
      .notNull()
      .references(() => profiles.email),
    followerEmail: text("follower_email")
      .notNull()
      .references(() => profiles.email),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.creatorEmail, table.followerEmail] }),
    index("follows_creator_idx").on(table.creatorEmail),
    index("follows_follower_idx").on(table.followerEmail),
  ],
);
