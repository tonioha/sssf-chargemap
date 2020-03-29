'use strict';
// connectionRoute
const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connectionController');

router.get('/', connectionController.connection_list_get);

router.get('/:id', connectionController.connection_get);

router.post('/', connectionController.connection_post);

module.exports = router;
