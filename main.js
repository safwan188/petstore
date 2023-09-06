// Import necessary packages
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const userRoutes = require('./routes/userRoutes');
const petRoutes = require('./routes/petRoutes');
const petItemRoutes = require('./routes/petItemRoutes');
const orderRoutes = require('./routes/orderRoutes');
const orderController = require('./controllers/orderController');
// Create an instance of express
const app = express();
const Chat = require('./models/Chat'); // Make sure the path is correct

// Create the HTTP server
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.use(express.static(path.join(__dirname, 'public')));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use(function(req, res, next){
    req.io = io;
    next();
});

app.use(userRoutes);
app.get('/', (req, res) => {
    res.render('login');
});
app.get('/login', (req, res) => {
    res.render('login');
})
app.get('/signup', (req, res) => {
    res.render('signup');
});

const adminRoutes = require('./routes/adminRoutes');
app.use('/admin', adminRoutes);

const branchesRouter = require('./routes/branchRoutes');
app.use('/branches', branchesRouter);

app.use('/pets', petRoutes); 
app.use('/orders', orderRoutes);
app.use('/pet-items', petItemRoutes);

// Set up our view engine to EJS
app.set('view engine', 'ejs');

// Connect to MongoDB using Mongoose
mongoose.connect("mongodb://localhost:27017/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("MongoDB Connected…")
}).catch(err => console.log(err))
app.get('/getUsername', function(req, res){
    res.json({username: req.session.username});
  });
  
// A simple route for file upload
app.post('/upload', upload.single('myFile'), (req, res) => {
    res.send('File uploaded successfully');
});

// Listen for connections to Socket.io

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('chat message', async (data) => {
        const  message = data.msg;
        const from = data.from;
        const to = data.to;

        // Create a new chat message
        const chat = new Chat({ from, to, message });

        // Save the chat message
        await chat.save();

        // Emit a 'chat message' event to all connected clients
        io.emit('chat message', { from, to, message });
    });
});






// Start the server
const port =  5000;
http.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
