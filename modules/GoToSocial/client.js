import postFn from "./post.js";
import uploadImageFn from "./uploadImage.js";

class GoToSocialClient {
  constructor(options) {
    this.domain = options.domain;
    this.token = options.access_token;
  }

  async post(options) {
    return await postFn(this.domain, this.token, options);
  }

  async postImage(options) {
    const imageData = await uploadImageFn(this.domain, this.token, options.file, options.description);
    console.log("image uploaded", imageData);
    options.media_ids = [imageData.id];
    return await postFn(this.domain, this.token, options);
  }
}

export default GoToSocialClient;
