const User = require('../models/User');
const Pet = require('../models/Pet');
const Chat = require('../models/Chat');

exports.getChats = async (req, res) => {
    if (req.session && req.session.username) {
        try {
            const chats = await Chat.find({
                $or: [
                    { from: req.session.username, to: 'admin' },
                    { from: 'admin', to: req.session.username }
                ]
            }).sort({ date: 1 }); // sorts the messages by date in ascending order
            res.json(chats);
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    } else {
        res.status(401).json({ error: 'Not logged in' });
    }
};


exports.home = async (req, res) => {
    if (req.session.username) {
        try {
            const pets = await Pet.find({});
            res.render('home', { username: req.session.username, pets: pets });
        } catch (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
        }
    } else {
        res.redirect('/login');
    }
}
exports.getUsername = (req, res) => {
    if (req.session && req.session.username) {
        res.json({ username: req.session.username });
    } else {
        res.status(401).json({ error: 'Not logged in' });
    }
};

// ... rest of your controller methods
exports.userChat = (req, res) => {
    res.render('chat');
};

exports.signup = async (req, res) => {
    const { username, password } = req.body;
    if (username.length > 10 || password.length > 10) {
        return res.status(400).json({ error: 'Username and password should be 10 characters or less.' });
    }
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already in use.' });
        }

        const user = new User({ username, password });
        await user.save();
        req.session.username = username; // storing username in session
        res.redirect('/home');
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
};

exports.getPetByName = async (req, res) => {
    const petName = req.params.petname;
    try {
        let pets;
        if (petName.toLowerCase() === "all") {
            pets = await Pet.find({});
        } else {
            pets = await Pet.find({ name: petName });
        }
        res.render('home2', { pets: pets ,username: req.session.username,}); // Render the 'home2' view, passing the pets data
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" }); // Send the error as JSON
    }
};



exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && password === user.password) { // removed bcrypt.compare
            req.session.username = username; // storing username in session
            res.redirect('/home');
        } else {
            res.status(400).json({ error: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
};


exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
}
