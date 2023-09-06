const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const Pet = require('../models/Pet'); // Make sure the path is correct
const PetItem = require('../models/PetItem');
const Order = require('../models/Order');
const User = require('../models/User');
const Twit = require('twit');
const Chat = require('../models/Chat');
let T = new Twit({
  consumer_key:         process.env.TWITTER_CONSUMER_KEY,
  consumer_secret:      process.env.TWITTER_CONSUMER_SECRET,
  access_token:         process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret:  process.env.TWITTER_TOKEN_SECRET,
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
})
router.post('/petitems/add', adminController.addPetItem);

router.post('/postTweet', (req, res) => {
    const tweet = req.body.status;
    T.post('statuses/update', {status: tweet}, function(error, data, response) {
      if(error) res.json({msg: 'Failed to post tweet', error: error});
      else res.json({msg: 'Tweet posted successfully'});
    });
});
  
router.get('/sales-data', async (req, res) => {
    try {
        const salesData = await Order.aggregate([
            {
                $match: { isOrdered: true }
            },
            {
                $unwind: "$orderedItems"
            },
            {
                $lookup: {
                    from: 'petitems', 
                    localField: 'orderedItems', 
                    foreignField: '_id', 
                    as: 'petitem'
                }
            },
            {
                $unwind: "$petitem"
            },
            {
                $group: {
                    _id: { month: { $month: "$orderDate" }, year: { $year: "$orderDate" } },
                    totalSales: { $sum: "$petitem.price" }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id.month",
                    year: "$_id.year",
                    sales: "$totalSales"
                }
            },
            {
                $sort: { year: 1, month: 1 }
            }
        ]);

        res.json(salesData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.get('/getChats/:username', async (req, res) => {
    try {
        const chats = await Chat.find({
            $or: [
                { from: req.params.username, to: 'admin' },
                { from: 'admin', to: req.params.username }
            ]
        });
        res.json(chats);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.get('/getUsers', async (req, res) => {
    try {
        const usersToAdmin = await Chat.distinct('from', { to: 'admin' });
        const usersFromAdmin = await Chat.distinct('to', { from: 'admin' });
        const users = [...new Set([...usersToAdmin, ...usersFromAdmin])];
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


router.get('/orders-data', async (req, res) => {
    try {
        // Get count of orders per user per month
        const ordersData = await Order.aggregate([
            {
                $group: {
                    _id: {
                        month: { $month: "$orderDate" },
                        year: { $year: "$orderDate" },
                        username: "$username"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id.month",
                    year: "$_id.year",
                    username: "$_id.username",
                    count: 1
                }
            },
            {
                $sort: { year: 1, month: 1, username: 1 }
            }
        ]);

        res.json(ordersData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
const checkAdmin = (req, res, next) => {
    if (req.session.username === 'admin') {
        next();
    } else {
        res.send('<script>alert("Forbidden: You are not an admin."); window.location.href = "/";</script>');
    }
}

router.put('/pets/update/:id', checkAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, breed, image } = req.body;
    try {
        await Pet.findByIdAndUpdate(id, { name, breed, image });
        res.status(200).send();
    } catch (err) {
        res.status(500).send(err.message);
    }
});
router.delete('/pets/delete/:id', checkAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await Pet.findByIdAndDelete(id);
        res.status(200).send();
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/pets/:id/items', checkAdmin, async (req, res) => {
    try {
        const petItems = await PetItem.find({ petId: req.params.id });
        res.render('adminPetItems', { petItems: petItems });
    } catch (err) {
        res.status(500).send(err.message);
    }
});
router.get('/chat', checkAdmin, (req, res) => {
    res.render('adminChat');
});

// Users
router.post('/users/create', checkAdmin, async (req, res) => {
    const { username, password } = req.body;
    const user = new User({ username, password }); // Include password here

    try {
        // Ideally, you would hash the password before storing it
        // For example, using bcrypt:
        // const hashedPassword = await bcrypt.hash(password, 10);
        // const user = new User({ username, password: hashedPassword });

        await user.save();
        res.status(200).send();
    } catch (err) {
        res.status(500).send(err.message);
    }
});


router.put('/users/update/:id', checkAdmin, async (req, res) => {
    const { id } = req.params;
    const { username, password } = req.body;

    try {
        // Ideally, you would hash the password before storing it
        // For example, using bcrypt:
        // const hashedPassword = await bcrypt.hash(password, 10);
        // await User.findByIdAndUpdate(id, { username, password: hashedPassword });

        await User.findByIdAndUpdate(id, { username, password });
        res.status(200).send();
    } catch (err) {
        res.status(500).send(err.message);
    }
});


router.post('/users/delete/:id', checkAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await User.findByIdAndRemove(id);
        res.status(200).send();
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Orders
router.post('/orders/delete/:id', checkAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await Order.findByIdAndRemove(id);
        res.status(200).send();
    } catch (err) {
        res.status(500).send(err.message);
    }
});
router.delete('/petItems/delete/:id', checkAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await PetItem.findByIdAndDelete(id);
        res.status(200).send();
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.put('/petItems/update/:id', checkAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, description, image } = req.body;
    try {
        await PetItem.findByIdAndUpdate(id, { name, description, image });
        res.status(200).send();
    } catch (err) {
        res.status(500).send(err.message);
    }
});
router.post('/pets/create', checkAdmin, async (req, res) => {
    const { name, breed,image } = req.body;
    const pet = new Pet({ name, breed,image });
    try {
        await pet.save();
        res.status(200).send();
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/', checkAdmin, adminController.showAdminPanel);
router.get('/pets', checkAdmin, adminController.showPets);
router.get('/orders', checkAdmin, adminController.showOrders);
router.get('/users', checkAdmin, adminController.showUsers);
router.get('/graphs', checkAdmin, (req, res) => {
    res.render('graphs');
});
// new route for chats
router.get('/chats', adminController.chats);
module.exports = router;
