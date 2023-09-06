const mongoose = require('mongoose');

const PetItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet'
    },
    image: { 
        type: String,
        required: false
    },
    description: { // new field 'description'
        type: String,
        required: false
    }
});

module.exports = mongoose.model('PetItem', PetItemSchema);
