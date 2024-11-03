import fetch from 'node-fetch';

export default class GoToSocialClient {
  constructor(options) {
    this.api_url = options.api_url;
    this.token = options.access_token;
  }

  async post(options) {
    const response = await fetch(`${this.api_url}statuses`, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.token,
      },
      body: JSON.stringify(options),
    });
    const responseData = await response.json();
    return responseData;
  }
}
