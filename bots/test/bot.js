import mastodonClient from "./../../modules/mastodon/index.js";

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.MASTODON_TEST_TOKEN,
    api_url: process.env.MASTODON_TEST_TOKEN_API,
  });
 
  const status = "1: Lorem ipsum dolor sit amet, consectetur adipiscing elit. 2: Quisque ultrices rhoncus elit, in porta mauris varius nec. 3: Ut dapibus vestibulum eros, at auctor augue ornare nec. 4: Donec sed sem molestie, suscipit arcu a, egestas urna. 5: Cras vitae sapien aliquam, pharetra nisl at, condimentum metus. 6: Vestibulum posuere tincidunt risus, ac congue diam sodales quis. 7: Mauris iaculis, orci non pulvinar suscipit, urna nunc tempor est, ut ornare tortor nisl sed est. 8: Aenean quis mollis ex. 9: Phasellus sem mi, lobortis non augue et, consequat rhoncus purus. 10: Vestibulum at arcu id ipsum consequat fringilla congue sit amet sem. 11: Praesent odio est, lacinia et mattis. 12: Lorem ipsum dolor sit amet, consectetur adipiscing elit. 13: Quisque ultrices rhoncus elit, in porta mauris varius nec. 14: Ut dapibus vestibulum eros, at auctor augue ornare nec. 15: Donec sed sem molestie, suscipit arcu a, egestas urna. 16: Cras vitae sapien aliquam, pharetra nisl at, condimentum metus. 17: Vestibulum posuere tincidunt risus, ac congue diam sodales quis. 18: Mauris iaculis, orci non pulvinar suscipit, urna nunc tempor est, ut ornare tortor nisl sed est. 19: Aenean quis mollis ex. 20: Phasellus sem mi, lobortis non augue et, consequat rhoncus purus. 21: Vestibulum at arcu id ipsum consequat fringilla congue sit amet sem. 22: Praesent odio est, lacinia et mattis. 23: Lorem ipsum dolor sit amet, consectetur adipiscing elit. 24: Quisque ultrices rhoncus elit, in porta mauris varius nec. 25: Ut dapibus vestibulum eros, at auctor augue ornare nec. 26: Donec sed sem molestie, suscipit arcu a, egestas urna. 27: Cras vitae sapien aliquam, pharetra nisl at, condimentum metus. 28: Vestibulum posuere tincidunt risus, ac congue diam sodales quis. 29: Mauris iaculis, orci non pulvinar suscipit, urna nunc tempor est, ut ornare tortor nisl sed est. 30: Aenean quis mollis ex. 31: Phasellus sem mi, lobortis non augue et, consequat rhoncus purus. 32: Vestibulum at arcu id ipsum consequat fringilla congue sit amet sem. 33: Praesent odio est, lacinia et mattis.";
  
  mastodon.post({status});

  return true;
};

export default botScript;
