'use strict';
// connectionTypeRoute
const express = require('express');
const router = express.Router();
const connectionTypeController = require('../controllers/connectionTypeController');

router.get('/', connectionTypeController.connectionType_list_get);

router.get('/:id', connectionTypeController.connectionType_get);

router.post('/', connectionTypeController.connectionType_post);

module.exports = router;
