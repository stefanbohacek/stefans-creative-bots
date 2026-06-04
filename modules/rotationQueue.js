import db from "./db.js";
import randomFromArray from "./randomFromArray.js";

export const getQueuedItems = async (queueId) => {
  let rows;
  try {
    [rows] = await db.execute(
      /* sql */
      `SELECT queue FROM rotation_queue WHERE queue_id = ?`,
      [queueId],
    );
  } catch (err) {
    console.log("rotationQueue: failed to load queue:", err.message);
    return [];
  }

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

  try {
    await db.execute(
      /* sql */
      `INSERT INTO rotation_queue (queue_id, queue) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE queue = VALUES(queue)`,
      [queueId, JSON.stringify(queue)],
    );
  } catch (err) {
    console.log("rotationQueue: failed to save queue:", err.message);
  }

  return nextItem;
};
