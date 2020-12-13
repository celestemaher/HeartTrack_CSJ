let db = require("../db");

let heartTrackDataSchema = new db.Schema({
    heartRateAvg:   Number, //BPM
    oxygenLevels:   Number, //percentage
    deviceId:      String,
    userEmail: String,
    timeCollected:  { type: Date, default: Date.now }
    //adjustedTime: String
    // day: Date.getUTCDate(),
    // month: Date.getUTCMonth(),
    // hour: Date.getUTCHours()

});

var heartTrackData = db.model("heartTrackData", heartTrackDataSchema);

module.exports = heartTrackData;
