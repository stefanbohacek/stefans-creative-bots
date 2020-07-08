/*
  1. Update the code below with fonts you want to use.
  2. Open Glitch console.
  3. Download the fonts: node scripts/get-google-fonts.js
  4. List downloaded fonts: cd fonts && ls
  5. Copy font name, for example Monoton-400-1.ttf
  6. See examples/overlay-google-font.js.
*/

var express = require('express'),
    GetGoogleFonts = require('get-google-fonts');

var ggf = new GetGoogleFonts({
	userAgent: 'Wget/1.18'
})

ggf.download([
  {
      'Noto Sans JP': [400, 700],
      'Noto Sans TC': [400, 700],
      'Cairo': [400, 700],
      'Hind Siliguri': [400, 700],
      'Baloo Tamma': [400, 700],
      'Pridi': [400, 700]
  },
  ['cyrillic']
]).then(() => {
  console.log('font(s) downloaded...');
}).catch(() => {
  console.log('unable to download font(s)...');
});