import { and, inArray, isNotNull, lte } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { logs, users } from '../drizzle/schema';
import app from './app';

interface Env {
  DB: D1Database;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_SERVICE_ACCOUNT: string; // サービスアカウントJSONをBase64エンコードした文字列
}

interface ServiceAccount {
  project_id: string;
  private_key: string;
  client_email: string;
}

async function sendPushNotification(env: Env) {
  // サービスアカウントJSONの取得とデコード
  const serviceAccount: ServiceAccount = JSON.parse(atob(env.FIREBASE_SERVICE_ACCOUNT));
  console.log({ serviceAccount })

  const db = drizzle(env.DB, { logger: true });

  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const threeDaysAgoStr = threeDaysAgo.toISOString();

  // カレンダーを3日以上開いていないユーザーIDを取得
  const userIDs = await db
    .selectDistinct({ user_id: logs.userId })
    .from(logs)
    .where(
      and(
        isNotNull(logs.userId),
        lte(logs.clickedAt, threeDaysAgoStr) // 3日以上前のログを検索
      )
    )
    .then(results => results
      .map(result => result.user_id)
      .filter((id): id is number => id !== null)
    );
  console.log({ userIDs })

  // そのユーザーIDが所属しているroomIdを取得
  const room_ids = await db
    .select({
      room_id: users.roomId,
      name: users.username
    })
    .from(users)
    .where(inArray(users.id, userIDs))
    .groupBy(users.roomId)
    .then(results => results
      .filter((result): result is { room_id: string; name: string } =>
        result.room_id !== null && result.name !== null)
    );
  console.log({ room_ids });

  for (const room of room_ids) {
    const payload = {
      message: {
        notification: {
          title: `${room.name}さんのカレンダーがめくられていません`,
          body: `${room.name}さんが最近カレンダーをめくっていません。連絡してみましょう。`
        },
        topic: room.room_id,
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1
            }
          },
          headers: {
            "apns-priority": "5"
          }
        }

      }
    }

    try {
      const response = await fetch(
        `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send?key=b4ebbcdc54c2ff67fe024e9d19cf2f9bbb2e5d16`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceAccount.private_key}`
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`FCM API Error: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log(`Current time: ${new Date()}. Successfully sent message:`, result);
    } catch (err) {
      console.error(`Current time: ${new Date()}. PUSH通知Error:`, err);
    }
  }
}

const scheduled: ExportedHandlerScheduledHandler<Env> = async (
  event: ScheduledController,
  env: Env,
  ctx: ExecutionContext
) => {
  ctx.waitUntil(sendPushNotification(env));
};

export default {
  fetch: app.fetch,
  scheduled,
}