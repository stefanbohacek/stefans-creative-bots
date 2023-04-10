/*
  This is a helper module for the Windy.com Webcams API.
  For full documentation visit https://api.windy.com/webcams/docs
*/

const request = require('request'),
      helpers = require(__dirname + '/helpers.js');

module.exports = {
  getWebcamPicture: (apiKey, location, cb) => {
    console.log('getWebcamPicture', apiKey, location);
    
    if (!location || !location.lat || !location.long){
      if (cb){
        cb({ error: 'no location provided' }, null);
      }
      
      return false;
    }

    let data = {},
        limit = 50,
        offset = 0;

    const radius = location.radius || 50;

    const apiUrl = `https://api.windy.com/api/webcams/v2/list/limit=${limit},${offset}/nearby=${location.lat},${location.long},${radius}?show=webcams:location,image&key=${apiKey}&limit=${limit},${offset}`;

    console.log({apiUrl});
    
    request(apiUrl, (error, response, body) => {
      try{
        data = JSON.parse(body);
        console.log('webcams', data.result.webcams);
      } catch(err){
        console.log('error:', err);
      }
      
      if (data && data.result && data.result.total){
        limit = data.result.limit;
        offset = helpers.getRandomInt(0, data.result.total - limit);
      }
      
      if (error && cb){
        cb(error, data);
        return false;
      }
    });
  }
};
