const Pet = require('../models/Pet');
const Order = require('../models/Order');
const User = require('../models/User');
const PetItem = require('../models/PetItem');   
exports.showAdminPanel = (req, res) => {
    res.render('adminPanel');
}
// existing controller methods...

exports.chats = function(req, res) {
    res.render('adminChat');  // replace 'adminChats' with the actual name of your chats view file
};

exports.showPets = async (req, res) => {
    const pets = await Pet.find({});
    res.render('adminPets', { pets });
}

exports.showOrders = async (req, res) => {
    const orders = await Order.find({}).populate('orderedItems');
    res.render('adminOrders', { orders });
}

exports.showUsers = async (req, res) => {
    const users = await User.find({});
    res.render('adminUsers', { users });
}
exports.addPetItem = async (req, res) => {
    const { name, price, category, petId, image } = req.body;

    const newPetItem = new PetItem({
        name,
        price,
        category,
        petId,
        image
    });

    try {
        await newPetItem.save();
        res.status(200).send('Pet item added successfully');
    } catch (error) {
        res.status(500).send('Error adding pet item');
    }
};