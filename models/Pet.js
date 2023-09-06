const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    breed: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('Pet', PetSchema);
