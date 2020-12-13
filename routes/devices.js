const express = require('express');
let router = express.Router();
let jwt = require("jwt-simple");
let fs = require('fs');
let Device = require("../models/device");
let HeartTrackData = require("../models/heartTrackData");
let User = require('../models/users');

// On Repl.it, add JWT_SECRET to the .env file, and use this code
let secret = process.env.JWT_SECRET

// On AWS ec2, you can use to store the secret in a separate file. 
// The file should be stored outside of your code directory. 
//let secret = fs.readFileSync(__dirname + '/../../jwtkey').toString();

// Function to generate a random apikey consisting of 32 characters
function getNewApikey() {
  let newApikey = "";
  let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 32; i++) {
    newApikey += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  return newApikey;
}

router.post('/register', function(req, res, next) {
  let responseJson = {
    registered: false,
    message: "",
    apikey: "none",
    deviceId: "none"
  };
  let deviceExists = false;

  // Ensure the request includes the deviceId parameter
  if (!req.body.hasOwnProperty("deviceId")) {
    responseJson.message = "Missing deviceId.";
    return res.status(400).json(responseJson);
  }

  let email = "";

  // If authToken provided, use email in authToken 
  if (req.headers["x-auth"]) {
    try {
      let decodedToken = jwt.decode(req.headers["x-auth"], secret);
      email = decodedToken.email;
    }
    catch (ex) {
      responseJson.message = "Invalid authorization token.";
      return res.status(401).json(responseJson);
    }
  }
  else {
    // Ensure the request includes the email parameter
    if (!req.body.hasOwnProperty("email")) {
      responseJson.message = "Invalid authorization token or missing email address.";
      return res.status(401).json(responseJson);
    }
    email = req.body.email;
  }

  // See if device is already registered+
  Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
    if (device !== null) {
      responseJson.message = "Device ID " + req.body.deviceId + " already registered.";
      return res.status(400).json(responseJson);
    }
    else {
      // Get a new apikey
      deviceApikey = getNewApikey();

      // Create a new device with specified id, user email, and randomly generated apikey.
      let newDevice = new Device({
        deviceId: req.body.deviceId,
        userEmail: email,
        apikey: deviceApikey
      });

      // Save device. If successful, return success. If not, return error message.
      newDevice.save(function(err, newDevice) {
        if (err) {
          responseJson.message = err;
          // This following is equivalent to: res.status(400).send(JSON.stringify(responseJson));
          return res.status(400).json(responseJson);
        }
        else {
          responseJson.registered = true;
          responseJson.apikey = deviceApikey;
          responseJson.deviceId = req.body.deviceId;
          responseJson.message = "Device ID " + req.body.deviceId + " was registered.";
          return res.status(201).json(responseJson);
        }
      });
    }
  });
});

router.post('/delete', function(req, res, next) {
  let responseJson = {
    deleted: false,
    message: "",
  };

  if (!req.body.hasOwnProperty("deviceId")) {
    responseJson.message = "Missing deviceId.";
    return res.status(400).json(responseJson);
  }

  Device.deleteOne({ deviceId: req.body.deviceId }, function(err, device) {
    if (err) {
      responseJson.message = err;
      return res.status(400).json(responseJson);
    }
    else {
      responseJson.deleted = true;
      responseJson.message = "Device ID " + req.body.deviceId + " was deleted.";
      return res.status(201).json(responseJson);
    }
  });
});



router.post('/apikey', function(req, res, next) {
  let responseJson = {
    success: true,
    message: "",
    apikey: "null",
    startTime: 800,
    stopTime: 2000,
    reminderTime: 30,
  };

  // Ensure the request includes the deviceId parameter
  if (!req.body.hasOwnProperty("deviceId")) {
    responseJson.success = false;
    responseJson.message = "Missing deviceId.";
    return res.status(400).json(responseJson);
  }

  //may need to be coreid rather than deviceid
  // {
  // "event": "{{{PARTICLE_EVENT_NAME}}}",
  // "data": "{{{PARTICLE_EVENT_VALUE}}}",
  // "coreid": "{{{PARTICLE_DEVICE_ID}}}",
  // "published_at": "{{{PARTICLE_PUBLISHED_AT}}}"
  // }
  Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
    if (err) {
      responeJson.success = false;
      responseJson.message = "Device is not registered.";
      return res.status(404).json(responseJson);
    }
    else {
      User.findOne({ email: device.userEmail}, function(err,user){
        if(err){
          responeJson.success = false;
          responseJson.message = "Device is registered but user cannot be found.";
          return res.status(404).json(responseJson);
        }else{
          responseJson.message = "Device was found. Values were returned.";
          responseJson.startTime = user.startTime;
          responseJson.stopTime = user.stopTime;
          responseJson.reminderTime = user.reminderTime;
          
        responseJson.apikey = device.apikey;
        return res.status(200).json(responseJson);
      //res.status(200).json(device.apikey);
        }
      });
    }
  });
});

module.exports = router;
