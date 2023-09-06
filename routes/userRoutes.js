const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/home', userController.home);
router.get('/home/:petname', userController.getPetByName);
router.get('/chat', userController.userChat); 
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/logout', userController.logout);
router.get('/getUsername', userController.getUsername);
router.get('/getChats', userController.getChats); // new route

module.exports = router;
