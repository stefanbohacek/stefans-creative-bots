const RiveScript = require('rivescript'),
      bartleby = new RiveScript(),
      helpers = require(__dirname + '/../helpers/helpers.js'),
      cronSchedules = require(__dirname + '/../helpers/cron-schedules.js'),
      mastodonClient = require(__dirname + '/../helpers/mastodon.js');

bartleby.loadDirectory(__dirname + '/../rivescript/bartleby').then(loadingDone).catch(loadingError);

function loadingDone(batchNum) {
  bartleby.sortReplies();
}
 
function loadingError(batchNum, error) {
  console.log("Error when loading files: ", batchNum, error);
}

const mastodon = new mastodonClient({
  access_token: process.env.BARTLEBY_MASTODON_ACCESS_TOKEN_SECRET,
  api_url: process.env.BARTLEBY_MASTODON_API
});

module.exports = {
  active: true,
  clients: {mastodon},
  name: 'Bartleby, the Scrivener',
  description: 'I would prefer not to.',
  about_url: 'https://botwiki.org/bot/bartleby_scrvnr/',
  reply: async (postID, from, messageText, fullMessage) => {
    console.log(`new message from ${from}: ${messageText}`);
    const messageTextLowercase = messageText.toLowerCase();
    const reply = await bartleby.reply('local-user', messageTextLowercase);
    console.log(`reply: ${reply}`);
    mastodon.reply(fullMessage, reply);
  }
};
