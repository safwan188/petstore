const express = require('express');
const router = express.Router();
const petItemController = require('../controllers/petItemController');

router.post('/add', petItemController.addPetItem);
router.get('/all', petItemController.getPetItems);

module.exports = router;
