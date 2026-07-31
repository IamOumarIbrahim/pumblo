import { EventEmitter } from 'events';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  handle: string;
  isVerifiedEmail: boolean;
  isHumanVerified: boolean;
  role: 'user' | 'owner';
  createdAt: Date;
  strikes: number;
  isBanned: boolean;
}

export interface HumanTrustToken {
  token: string;
  userId: string;
  expiresAt: number; // timestamp ms
  issuedAt: number;
}

export interface Video {
  id: string;
  slug: string;
  title: string;
  userId: string;
  generationTool: string;
  generationMode: string;
  license: string;
  depictsRealPerson: boolean;
  promptDisclosure?: 'public' | 'private' | 'none';
  c2paVerified: boolean;
  pcsScore: number;
  sqsScore: number;
  videoUrl: string;
  status: 'published' | 'moderation_review' | 'rejected';
  hasSevereFlag: boolean;
  createdAt: Date;
  views: number;
  likes: number;
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

export interface ConsentRecord {
  id: string;
  videoId: string;
  userId: string;
  depictedPersonName: string;
  documentRef: string;
  status: 'pending' | 'approved' | 'rejected';
}

class InMemoryDB extends EventEmitter {
  users: Map<string, User> = new Map();
  sessions: Map<string, { userId: string; expiresAt: number }> = new Map();
  humanTokens: Map<string, HumanTrustToken> = new Map();
  videos: Map<string, Video> = new Map();
  comments: Comment[] = [];
  consentRecords: Map<string, ConsentRecord> = new Map();

  async clear() {
    this.users.clear();
    this.sessions.clear();
    this.humanTokens.clear();
    this.videos.clear();
    this.comments = [];
    this.consentRecords.clear();
  }

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'strikes' | 'isBanned'>): Promise<User> {
    const id = 'usr_' + Math.random().toString(36).slice(2, 10);
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date(),
      strikes: 0,
      isBanned: false,
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return null;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByHandle(handle: string): Promise<User | null> {
    for (const u of this.users.values()) {
      if (u.handle.toLowerCase() === handle.toLowerCase()) return u;
    }
    return null;
  }

  async createSession(userId: string, ttlMs: number = 86400000): Promise<string> {
    const sessionId = 'sess_' + Math.random().toString(36).slice(2, 16);
    this.sessions.set(sessionId, { userId, expiresAt: Date.now() + ttlMs });
    return sessionId;
  }

  async getSession(sessionId: string): Promise<{ userId: string } | null> {
    const s = this.sessions.get(sessionId);
    if (!s) return null;
    if (Date.now() > s.expiresAt) {
      this.sessions.delete(sessionId);
      return null;
    }
    return s;
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async createHumanToken(userId: string, ttlMs: number = 3600000): Promise<string> {
    const token = 'htt_' + Math.random().toString(36).slice(2, 18);
    this.humanTokens.set(token, {
      token,
      userId,
      issuedAt: Date.now(),
      expiresAt: Date.now() + ttlMs,
    });
    return token;
  }

  async validateHumanToken(token: string): Promise<HumanTrustToken | null> {
    const ht = this.humanTokens.get(token);
    if (!ht) return null;
    if (Date.now() > ht.expiresAt) {
      this.humanTokens.delete(token);
      return null;
    }
    return ht;
  }

  async createVideo(videoData: Omit<Video, 'id' | 'slug' | 'createdAt' | 'views' | 'likes'>): Promise<Video> {
    const id = 'vid_' + Math.random().toString(36).slice(2, 10);
    const slug = videoData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + id.slice(-4);
    const video: Video = {
      ...videoData,
      id,
      slug,
      createdAt: new Date(),
      views: 0,
      likes: 0,
    };
    this.videos.set(id, video);
    if (video.status === 'published') {
      this.emit('video.published', { videoId: id, userId: video.userId });
    }
    return video;
  }

  async getVideoById(id: string): Promise<Video | null> {
    return this.videos.get(id) || null;
  }

  async getVideoBySlug(slug: string): Promise<Video | null> {
    for (const v of this.videos.values()) {
      if (v.slug === slug) return v;
    }
    return null;
  }

  async queryVideos(filters: {
    tool?: string;
    mode?: string;
    license?: string;
    provenanceOnly?: boolean;
    discoveryOnly?: boolean;
    sort?: 'sqs' | 'newest';
  }): Promise<Video[]> {
    let result = Array.from(this.videos.values());

    if (filters.discoveryOnly) {
      result = result.filter(v => v.status === 'published' && !v.hasSevereFlag);
    }
    if (filters.provenanceOnly) {
      result = result.filter(v => v.c2paVerified);
    }
    if (filters.tool && filters.tool !== 'all' && filters.tool !== 'auto-detect') {
      result = result.filter(v => v.generationTool.toLowerCase() === filters.tool!.toLowerCase());
    }
    if (filters.mode) {
      result = result.filter(v => v.generationMode === filters.mode);
    }
    if (filters.license) {
      result = result.filter(v => v.license === filters.license);
    }

    if (filters.sort === 'newest') {
      result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else {
      result.sort((a, b) => b.sqsScore - a.sqsScore);
    }

    return result;
  }

  async addComment(videoId: string, userId: string, content: string): Promise<Comment> {
    const comment: Comment = {
      id: 'cmt_' + Math.random().toString(36).slice(2, 10),
      videoId,
      userId,
      content,
      createdAt: new Date(),
    };
    this.comments.push(comment);
    return comment;
  }

  async getComments(videoId: string): Promise<Comment[]> {
    return this.comments.filter(c => c.videoId === videoId);
  }

  async addStrike(userId: string): Promise<number> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    user.strikes += 1;
    if (user.strikes >= 3) {
      user.isBanned = true;
    }
    return user.strikes;
  }
}

export const db = new InMemoryDB();
