import db from "./db.js";
import randomFromArray from "./randomFromArray.js";

export const getQueuedItems = async (queueId) => {
  const [rows] = await db.execute(
    /* sql */
    `SELECT queue FROM rotation_queue WHERE queue_id = ?`,
    [queueId],
  );

  return rows.length ? rows[0].queue || [] : [];
};

export const getNextItem = async (queueId, queuedItems) => {
  if (!queuedItems || !queuedItems.length) {
    return null;
  }

  let queue = await getQueuedItems(queueId);

  if (!queue.length) {
    queue = randomFromArray(queuedItems, queuedItems.length);
  }

  const nextItem = queue.shift();

  await db.execute(
    /* sql */
    `INSERT INTO rotation_queue (queue_id, queue) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE queue = VALUES(queue)`,
    [queueId, JSON.stringify(queue)],
  );

  return nextItem;
};
