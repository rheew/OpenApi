const request = require('request');
var parseString = require('xml2js').parseString;

var url = 'http://www.weather.go.kr/weather/forecast/mid-term-rss3.jsp?stnld=109';
request(url, function (error, response, body) {
  console.error('error:', error); // Print the error if one occurred
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  //console.log('body:', body); // Print the HTML for the Google homepage.
  parseString(body, function (err, result) {
    console.dir(result.rss.channel[0]);
    });
});

