import { signUp } from '../lib/auth/index.js';
import { db } from '../lib/db/index.js';

async function main() {
  const emailArgIdx = process.argv.indexOf('--email');
  const email = emailArgIdx !== -1 && process.argv[emailArgIdx + 1] ? process.argv[emailArgIdx + 1] : 'owner@pumblo.ai';

  try {
    const user = await signUp(email, 'OwnerInitialPass123!', 'owner');
    user.role = 'owner';
    user.isHumanVerified = true;
    const token = await db.createHumanToken(user.id);

    console.log(`[create-owner] Owner account created successfully for: ${email}`);
    console.log(`[create-owner] One-time setup token issued: ${token}`);
    console.log(`[create-owner] Complete verification at: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/setup?token=${token}`);
  } catch (err: any) {
    console.error(`[create-owner] Error: ${err.message}`);
    process.exit(1);
  }
}

main();
