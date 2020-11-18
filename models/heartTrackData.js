let db = require("../db");

let heartTrackDataSchema = new db.Schema({
    heartRateAvg:   Float, //BPM
    oxygenLevels:   Float, //percentage
    deviceID:      String,
    timeCollected:  { type: Date, default: Date.now }
});

var heartTrackData = db.model("heartTrackData", heartTrackDataSchema);

module.exports = heartTrackData;
