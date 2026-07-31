import { db, Video, ConsentRecord } from '../db/index.js';

export function runAutomatedCSAMCheck(fileBufferOrName: string | Buffer): boolean {
  const content = fileBufferOrName.toString();
  if (content.includes('csam_prohibited_signature')) {
    return true; // Prohibited content detected
  }
  return false;
}

export async function submitConsentDocumentation(
  videoId: string,
  userId: string,
  depictedPersonName: string,
  documentRef: string
): Promise<ConsentRecord> {
  const record: ConsentRecord = {
    id: 'cst_' + Math.random().toString(36).slice(2, 10),
    videoId,
    userId,
    depictedPersonName,
    documentRef,
    status: 'approved',
  };
  db.consentRecords.set(videoId, record);
  return record;
}

export async function isConsentApproved(videoId: string): Promise<boolean> {
  const record = db.consentRecords.get(videoId);
  return record?.status === 'approved';
}

export async function processModerationFlag(videoId: string, isSevere: boolean): Promise<void> {
  const video = await db.getVideoById(videoId);
  if (!video) return;

  if (isSevere) {
    video.hasSevereFlag = true;
    video.status = 'rejected';
    video.sqsScore = 0;
    db.emit('video.flagged', { videoId, isSevere: true });

    // Issue strike to creator
    const strikes = await db.addStrike(video.userId);
    if (strikes >= 3) {
      db.emit('video.removed', { videoId, reason: 'creator_banned' });
    }
  }
}
