export type CommunitySignals = {
  likes: number;
  comments: number;
  views: number;
};

export const COMMUNITY_ORDER_SQL = `(
  (SELECT COUNT(*) FROM likes community_likes WHERE community_likes.video_id = v.id) * 6 +
  (SELECT COUNT(*) FROM comments community_comments WHERE community_comments.video_id = v.id) * 4 +
  MIN(v.views, 500) * 0.05
) DESC, v.created_at DESC`;

export function communityScore({
  likes,
  comments,
  views,
}: CommunitySignals): number {
  return (
    whole(likes) * 6 +
    whole(comments) * 4 +
    Math.min(whole(views), 500) * 0.05
  );
}

function whole(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}
