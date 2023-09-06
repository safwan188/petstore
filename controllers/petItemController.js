const PetItem = require('../models/PetItem');

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

exports.getPetItems = async (req, res) => {
    try {
        const petItems = await PetItem.find();
        res.status(200).json(petItems);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
}
