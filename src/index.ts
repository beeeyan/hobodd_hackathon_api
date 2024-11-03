import { and, inArray, isNotNull, lte } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { messaging } from "firebase-admin";
import { logs, users } from '../drizzle/schema';
import app from './app';

interface Env {
  DB: D1Database
}

async function sendPushNotification(env: Env) {
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
      notification: {
        title: `${room.name}さんのカレンダーがめくられていません`,
        body: `${room.name}さんが最近カレンダーをめくっていません。連絡してみましょう。`
      },
      topic: room.room_id,
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
          options: {
            priority: "normal",
          },
        },
      },
    };
    console.log({ payload })

    await messaging().send(payload)
      .then((response) => {
        console.log(`Current time: ${new Date()}. Successfully sent message: ${response}`)
      })
      .catch((err) => {
        console.error(`Current time: ${new Date()}. PUSH通知Error ${err}`);
      });
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