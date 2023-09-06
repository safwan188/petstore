const Pet = require('../models/Pet');

exports.addPet = async (req, res) => {
    const { name, breed, age } = req.body;
    try {
        const pet = new Pet({ name, breed, age });
        await pet.save();
        res.status(201).json(pet);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
}

exports.getPets = async (req, res) => {
    try {
        const pets = await Pet.find();
        res.status(200).json(pets);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
}
