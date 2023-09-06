const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const PetItem = require('../models/PetItem');
const Pet = require('../models/Pet');

router.get('/:petId/items', async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.petId);
        const petItems = await PetItem.find({ petId: pet._id });

        // Fetch all categories.
        const allPetItems = await PetItem.find();
        const categories = [...new Set(allPetItems.map(item => item.category))];

        res.render('petItems', { pet: pet, petItems: petItems, categories: categories });
    } catch(err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});
router.get('/:petId/items/:category', async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.petId);
        const category = req.params.category;
        let petItems;

        // If 'all' is selected, display all items, otherwise filter by category.
        if (category === "all") {
            petItems = await PetItem.find({ petId: pet._id });
        } else {
            petItems = await PetItem.find({ petId: pet._id, category: category });
        }

        // Fetch all categories.
        const allPetItems = await PetItem.find();
        const categories = [...new Set(allPetItems.map(item => item.category))];

        // Render the petItemsCategory view, passing the pet, petItems and categories
        res.render('petItemsCategory', { pet: pet, petItems: petItems, categories: categories });
    } catch(err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/add', petController.addPet);
router.get('/all', petController.getPets);

module.exports = router;
