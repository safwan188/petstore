const mongoose = require('mongoose');
const branchSchema = new mongoose.Schema({
    name: String,
    lat: Number,
    lon: Number
});
module.exports = mongoose.model('Branch', branchSchema);
