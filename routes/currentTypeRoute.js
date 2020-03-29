'use strict';
// currentTypeRoute
const express = require('express');
const router = express.Router();
const currentTypeController = require('../controllers/currentTypeController');

router.get('/', currentTypeController.currentType_list_get);

router.get('/:id', currentTypeController.currentType_get);

router.post('/', currentTypeController.currentType_post);

module.exports = router;
