const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');
// List all branches
router.get('/', async (req, res) => {
    const branches = await Branch.find();
    res.json(branches);
});

// Create a new branch
router.post('/', async (req, res) => {
    const branch = new Branch(req.body);
    await branch.save();
    res.json({ message: 'Branch created!', branch });
});

// Delete a branch
router.delete('/:id', async (req, res) => {
    const branch = await Branch.findByIdAndRemove(req.params.id);
    res.json({ message: 'Branch deleted!', branch });
});

module.exports = router;
