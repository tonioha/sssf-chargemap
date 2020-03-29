'use strict';
// levelTypeRoute
const express = require('express');
const router = express.Router();
const levelTypeController = require('../controllers/levelTypeController');

router.get('/', levelTypeController.levelType_list_get);

router.get('/:id', levelTypeController.levelType_get);

router.post('/', levelTypeController.levelType_post);

module.exports = router;
