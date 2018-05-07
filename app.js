const StreamrClient = require('streamr-client');
const https = require('https');
var request = require('request');

// Ahoy Hacker, fill in this!
const STREAM_NAME = process.env.STREAM_NAME
if (STREAM_NAME === undefined) {
    throw new Error('Must export environment variable STREAM_NAME');
}
const API_KEY = process.env.API_KEY
if (API_KEY === undefined) {
  throw new Error('Must export environment variable API_KEY');
}
const LONGITUDE = process.env.LONGITUDE
if (LONGITUDE === undefined) {
  throw new Error('Must export environment variable LONGITUDE');
}
const LATITUDE = process.env.LATITUDE
if (LATITUDE === undefined) {
  throw new Error('Must export environment variable LATITUDE');
}
const UPDATE_FREQ = process.env.UPDATE_FREQ
if (UPDATE_FREQ === undefined) {
  throw new Error('Must export environment variable UPDATE_FREQ');
}

main().catch(console.error);

async function main() {
    // Initialize Streamr-Client library
    const client = new StreamrClient({
        apiKey: API_KEY
    });

    // Get a Stream (creates one if does not already exist)
    const stream = await client.getOrCreateStream({
        name: STREAM_NAME
    });

    await getSensorData(stream);
}

async function getSensorData(stream) {
    request('https://api.smartcitizen.me/v0/devices?near='+LONGITUDE+','+LATITUDE+'&q[kit_id_gteq]=14', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var deviceDatas = JSON.parse(body);
            sendSensorData(deviceDatas, stream);
        }
    });

    setTimeout(getSensorData.bind(null, stream), UPDATE_FREQ);
}

async function sendSensorData(deviceDatas, stream) {
    await deviceDatas.forEach(function (deviceData) {
        var owner = deviceData.owner;
        var location = deviceData.data.location;

        deviceData.data.sensors.forEach(function (sensorData) {
            extendSensorData(sensorData, deviceData, owner, location);

            stream.produce(sensorData);
            console.log("Sending data:", sensorData);
        });
    });
}

function extendSensorData(sensorData, kitData, owner, location) {
    sensorData.kitId = kitData.id;
    sensorData.kitName = kitData.name;

    if (owner != null) {
        sensorData.ownerId = owner.id;
        sensorData.ownerName = owner.username;
        sensorData.ownerUrl = owner.url;
    }

    sensorData.latitude = location.latitude;
    sensorData.longitude = location.longitude;
    sensorData.exposure = location.exposure;
    sensorData.elevation = location.elevation;
}