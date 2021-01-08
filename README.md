# Stefan's Creative Bots

![Tweetin'](https://botwiki.org/wp-content/uploads/2020/05/tweet.gif)

Built with the [creative-bots](https://glitch.com/edit/#!/creative-bots) project and powered by [Glitch](https://glitch.com). See the [showcase page](https://stefans-creative-bots.glitch.me/showcase) for a list of bots.

## Known issues

**Chrome is not installed.**

Use the terminal to reinstall puppeteer and use puppeteer's Chrome installation script.

```
npm install puppeteer
node node_modules/puppeteer/install.js
```

On Glitch, project dependencies get reinstalled every 12 hours even on boosted apps, so you will need to update your `scripts` entry inside `package.json` to look like this:

```
  "scripts": {
    "start": "node server.js",
    "postinstall": "npm install puppeteer; node node_modules/puppeteer/install.js"
  },
```