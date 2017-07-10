'use strict';

const yargs = require('yargs');
const axios = require('axios');

const log = (event) => {
  console.log('Event', JSON.stringify(event, null, 2));
  return Promise.resolve(event);
};

const getWeather = (event) => {
  var encodedAddress = encodeURIComponent(event.address);
  console.log("encodedAddress: " + encodedAddress);
  var geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}`;

  axios.get(geocodeUrl).then((response) => {
      if (response.data.status === 'ZERO_RESULTS') {
        throw new Error('Unable to find that address.');
      }

      var lat = response.data.results[0].geometry.location.lat;
      var lng = response.data.results[0].geometry.location.lng;
      var weatherUrl = `https://api.forecast.io/forecast/4a04d1c42fd9d32c97a2c291a32d5e2d/${lat},${lng}`;
      console.log("Formatted Address: " + response.data.results[0].formatted_address);
      return axios.get(weatherUrl);
    }).then((response) => {
      var temperature = response.data.currently.temperature;
      var apparentTemperature = response.data.currently.apparentTemperature;
      console.log(`It's currently ${temperature}. It feels like ${apparentTemperature}.`);

      var newResponse = {
        "temperature": temperature,
        "apparentTemperature": apparentTemperature
      };
      console.log("Response: " + JSON.stringify(newResponse, null, 2));

      return Object.assign(event, { newResponse });
    }).catch((e) => {
      if (e.code === 'ENOTFOUND') {
        console.log('Unable to connect to API servers.');
      } else {
        console.log(e.message);
      }
  });
}

module.exports.handler = (event, context, callback) => log(event)
  .then(getWeather) // Get Weather information
  //.then(() => callback(null)) // Success
  .catch(callback); // Error