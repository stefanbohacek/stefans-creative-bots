CREATE TABLE IF NOT EXISTS mentions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bot_handle VARCHAR(255) NOT NULL,
  notification_id VARCHAR(32) NOT NULL,
  status_id VARCHAR(32) NOT NULL,
  from_acct VARCHAR(255) NOT NULL,
  from_display_name VARCHAR(255),
  content TEXT NOT NULL,
  spoiler_text TEXT,
  visibility VARCHAR(16),
  status_url VARCHAR(512),
  mentioned_at DATETIME NOT NULL,
  responded TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY bot_notification (bot_handle, notification_id)
);
