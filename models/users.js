let db = require("../db");

let userSchema = new db.Schema({
  email:          { type: String, required: true, unique: true },
  fullName:       { type: String, required: true },
  passwordHash:   String,
  dateRegistered: { type: Date, default: Date.now },
  lastAccess:     { type: Date, default: Date.now },
  userDevices:    [String],
  userHeartdata:  [String],
  startTime:      {type: Number, default: 800},
  stopTime:       {type: Number, default: 2000},
  reminderTime:   {type: Number, default: 30}
  //potholesHit:    [ { potholeId: Number, numHits: Number } ]
});

let User = db.model("User", userSchema);

module.exports = User;
