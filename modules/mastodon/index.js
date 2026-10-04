import Mastodon from "mastodon-api";

import post from './post.js';
import postImage from './post-image.js';
import uploadMediaFn from './upload-media.js';
import reply from './reply.js';
import postPoll from './post-poll.js';
import getNotifications from './get-notifications.js';
import dismissNotification from './dismiss-notifications.js';

class MastodonClient {
  constructor(keys) {
    let mastodonClientInstance = {};

    if (keys && keys.access_token && keys.api_url) {
      mastodonClientInstance = new Mastodon(keys);
    } else {
      console.log("mastodon error: missing token or API URL");
    }

    this.client = mastodonClientInstance;
  }

  post(status) {
    return post(this.client, status);
  }

  postImage(options) {
    return postImage(this.client, options);
  }

  reply(message, response) {
    return reply(this.client, message, response);
  }

  postPoll(status, options, params) {
    return postPoll(this.client, status, options, params);
  }

  uploadMedia(options) {
    return uploadMediaFn(this.client, options);
  }

  getNotifications() {
    return getNotifications(this.client);
  }

  dismissNotification(notification) {
    return dismissNotification(this.client, notification);
  }
}

export default MastodonClient;
