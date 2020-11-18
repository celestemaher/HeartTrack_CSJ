const express = require('express');
let router = express.Router();
let bcrypt = require("bcryptjs");
let jwt = require("jwt-simple");
let fs = require('fs');
let User = require('../models/users');
let Device = require('../models/device');
let HeartTrackData = require('../models/heartTrackData');

// FIXME: This is really bad practice to put an encryption key in code.
//let secret = "notasecretkeyyet";

// On Repl.it, add JWT_SECRET to the .env file, and use this code
let secret = process.env.JWT_SECRET

// On AWS ec2, you can use to store the secret in a separate file. 
// The file should be stored outside of your code directory. 
// let secret = fs.readFileSync(__dirname + '/../../jwtkey').toString();

// Register a new user
router.post('/register', function(req, res) {
  bcrypt.hash(req.body.password, 10, function(err, hash) {
    if (err) {
      res.status(400).json({success : false, message : err.errmsg});  
    }
    else {
      let newUser = new User({
        email: req.body.email,
        fullName: req.body.fullName,
        passwordHash: hash
      });
      // newUser.userDevices.push(req.body.userDevices);
      newUser.save(function(err, user) {
        if (err) {
          res.status(400).json({success: false,
                                message: err.errmsg});
        }
        else {
          res.status(201).json({success: true,
                                message: user.fullName + " has been created."});
        }
      });
    }
  });    
});

// Authenticate a user
router.post('/signin', function(req, res) {
  User.findOne({email: req.body.email}, function(err, user) {
    if (err) {
      res.status(401).json({ success: false, message: "Can't connect to DB." });
    }
    else if (!user) {
      res.status(401).json({ success: false, message: "Email or password invalid." });
    }
    else {
      bcrypt.compare(req.body.password, user.passwordHash, function(err, valid) {
        if (err) {
          res.status(401).json({ success: false, message: "Error authenticating. Contact support." });
        }
        else if(valid) {
          let authToken = jwt.encode({email: req.body.email}, secret);
          res.status(201).json({ success: true, authToken: authToken });
        }
        else {
          res.status(401).json({ success: false, message: "Email or password invalid." });
        }
      });
    }
  });
});

// Return account information
router.get('/account', function(req, res) {
  if (!req.headers["x-auth"]) {
    res.status(401).json({ success: false, message: "No authentication token."});
    return;
  }

  let authToken = req.headers["x-auth"];
  let accountInfo = { };

  try {
     // Toaken decoded
     let decodedToken = jwt.decode(authToken, secret);+

     User.findOne({email: decodedToken.email}, function(err, user) {
       if (err) {
         res.status(400).json({ success: false, message: "Error contacting DB. Please contact support."});
       }
       else {
         accountInfo["success"] = true;
         accountInfo["email"] = user.email;
         accountInfo["fullName"] = user.fullName;
         accountInfo["lastAccess"] = user.lastAccess;
         accountInfo['devices'] = [];   // Array of devices
          
         // TODO: Get devices registered by uses from devices collection
         // Add each device to the accountInfo['devices'] array

        Device.find({ userEmail : decodedToken.email}, function(err, devices) {
           if (!err) {
             for (device of devices) {
               accountInfo['devices'].push({ deviceId: device.deviceId, apikey: device.apikey });
             }
           }

           HeartTrackData.find({ deviceID : device.deviceId}, function(err, heartData) {
              if (!err) {
                 for (data of heartData) {
                 accountInfo['userHeartdata'].push({ heartRateAvg: data.heartRateAvg, oxygenLevels: data.oxygenLevels, timeCollected: data.timeCollected});
                }
              }
           });

           res.status(200).json(accountInfo);
         });
       }
     });
  }
  catch (ex) {
    // Token was invalid
    res.status(401).json({ success: false, message: "Invalid authentication token."});
  }
});

router.post('/reading', function(req, res) {

  

  let newHeartTrackData = new HeartTrackData({
    deviceId: req.body.deviceId,
    userEmail: email,
    apikey: deviceApikey
  });
});

module.exports = router;
