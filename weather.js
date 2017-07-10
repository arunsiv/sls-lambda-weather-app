'use strict';

const yargs = require('yargs');
const axios = require('axios');

const log = (event) => {
  console.log('Event', JSON.stringify(event, null, 2));
  return Promise.resolve(event);
};

var result = null;
const getWeather = (event) => {
  console.log("1...");
  console.log('Event', JSON.stringify(event, null, 2));
  var encodedAddress = null;

  if (event.queryStringParameters !== null && event.queryStringParameters !== undefined) {
    if (event.queryStringParameters.address !== undefined && event.queryStringParameters.address !== null && event.queryStringParameters.address !== "") {
	  console.log("2...");
      encodedAddress = event.queryStringParameters.address;
	}
  }

  console.log("encodedAddress: " + encodedAddress);
  var geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}`;

  axios.get(geocodeUrl).then((response) => {
      console.log("3...");
      if (response.data.status === 'ZERO_RESULTS') {
        throw new Error('Unable to find that address.');
      }

      var lat = response.data.results[0].geometry.location.lat;
      var lng = response.data.results[0].geometry.location.lng;
      var weatherUrl = `https://api.forecast.io/forecast/4a04d1c42fd9d32c97a2c291a32d5e2d/${lat},${lng}`;
      console.log("Formatted Address: " + response.data.results[0].formatted_address);
      return axios.get(weatherUrl);
    }).then((response) => {
      console.log("4...");
      var temperature = response.data.currently.temperature;
      var apparentTemperature = response.data.currently.apparentTemperature;
      console.log(`It's currently ${temperature}. It feels like ${apparentTemperature}.`);

      result = {
        statusCode: 200,
        body: JSON.stringify({
          message: `It's currently ${temperature}. It feels like ${apparentTemperature}.`,
          input: event,
        }),
      };

      console.log(`Response : ${result}`);

    }).catch((e) => {
      console.log("5...");
      if (e.code === 'ENOTFOUND') {
        console.log('Unable to connect to API servers.');
      } else {
        console.log(e.message);
      }
  });
}

module.exports.handler = (event, context, callback) =>
  Promise.resolve(event)
    .then(getWeather) // Get Weather information
    .then(() => {
      console.log("6...");
      callback(null, result);
      console.log("7...");
    })
    .catch((e) => {
      console.log("8...");
      callback(e);
    });