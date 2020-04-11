const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', (req, res) => {
    res.send('With this endpoint you can get users');
});

router.get('/:id', (req, res) => {
    res.send('With this endpoint you can get a user');
});

router.post('/', userController.user_post);

router.put('/', (req, res) => {
    res.send('With this endpoint you can edit users');
});

router.delete('/', (req, res) => {
    res.send('With this endpoint you can delete users');
});

module.exports = router;
