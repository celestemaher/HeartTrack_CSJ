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
//let secret = process.env.JWT_SECRET

// On AWS ec2, you can use to store the secret in a separate file. 
// The file should be stored outside of your code directory. 
 let secret = fs.readFileSync(__dirname + '/../../jwtkey').toString();

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
         accountInfo['userHeartdata'] = []; //Array of User Heart Track Data
          
         // TODO: Get devices registered by uses from devices collection
         // Add each device to the accountInfo['devices'] array
         //get data from hearttrack and add data to User heart Data

        Device.find({ userEmail : decodedToken.email}, function(err, devices) {
           if (!err) {
             for (device of devices) {
              accountInfo['devices'].push({ deviceId: device.deviceId, apikey: device.apikey });
	      
          
              HeartTrackData.find({ deviceId : device.deviceId}, function(err, heartTrackData) {  
 		 if (!err) {
                    for (heartData of heartTrackData) {
		       console.log({heartRateAvg: heartData.heartRateAvg, oxygenLevels: heartData.oxygenLevels});
                       accountInfo['userHeartdata'].push({ heartRateAvg: heartData.heartRateAvg, oxygenLevels: heartData.oxygenLevels});
                  }
                }
  		console.log(accountInfo);
           	res.status(200).json(accountInfo);
              });  
             }
           }
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

  var responseJson = { 
    status : "",
    message : ""
  };

  if( !req.body.hasOwnProperty("deviceId") ) {
    responseJson.status = "ERROR";
    responseJson.message = "Request missing deviceId parameter.";
    return res.status(401).send(JSON.stringify(responseJson));
  }

  if( !req.body.hasOwnProperty("apikey") ) {
    responseJson.status = "ERROR";
    responseJson.message = "Request missing apikey parameter.";
    return res.status(401).send(JSON.stringify(responseJson));
  }

  if( !req.body.hasOwnProperty("heartRateAvg") ) {
    responseJson.status = "ERROR";
    responseJson.message = "Request missing heartRateAvg parameter.";
    return res.status(401).send(JSON.stringify(responseJson));
  }

  if( !req.body.hasOwnProperty("oxygenLevels") ) {
    responseJson.status = "ERROR";
    responseJson.message = "Request missing oxygenLevels parameter.";
    return res.status(401).send(JSON.stringify(responseJson));
  }

  Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
    if (device !== null) {
      if (device.apikey != req.body.apikey) {
        responseJson.status = "ERROR";
        responseJson.message = "Invalid apikey for device ID " + req.body.deviceId + ".";
        return res.status(401).send(JSON.stringify(responseJson));
      }
      else {
        var newHeartTrackData = new HeartTrackData({
          heartRateAvg:   req.body.heartRateAvg, //BPM
          oxygenLevels:   req.body.oxygenLevels, //percentage
          deviceId:      req.body.deviceId
          //timeCollected:  Date.now
        });

        newHeartTrackData.save(function(err, heartTrackData) {
          if(err){
            responseJson.status = "ERROR";
            responseJson.message = "Error saving data in db.";
            return res.status(401).send(JSON.stringify(responseJson));
          }
          else {
            responseJson.status = "OK";
            responseJson.message = "Data saved in db with object ID " + req.body.deviceId + ".";
            return res.status(201).send(JSON.stringify(responseJson));
          }
        });
      }
    }
    else{
      responseJson.status = "ERROR";
      responseJson.message = "Device ID " + req.body.deviceId + " not registered.";
      return res.status(401).send(JSON.stringify(responseJson));    
    }

  });

});

module.exports = router;
