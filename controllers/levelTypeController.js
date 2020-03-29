'use strict';
const levelTypeModel = require('../models/leveltype');

const levelType_list_get = async (req, res) => {
    try {
        const levelTypes = await levelTypeModel.find().populate('Connections');
        await res.json(levelTypes);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

const levelType_get = async (req, res) => {
    try {
        const levelType = await levelType.findById(req.params.id);
        res.json(levelType);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

const levelType_post = async (req, res) => {
    let errors = [];

    if (!req.body.comments) { errors.push("No comments given")};
    if (!req.body.capability) { errors.push("No capability given")};
    if (!req.body.title) { errors.push("No title given")};

    if (errors.length) {
        res.status(400).json({ "error":errors.join(", ")});
        return;
    }

    const lvlType = await levelTypeModel.create({
        Comments: req.body.comments,
        IsFastChargeCapable: req.body.capability,
        Title: req.body.title
    });
    res.send(`Level created with id: ${lvlType._id}`);
};

module.exports = {
    levelType_list_get,
    levelType_get,
    levelType_post,
};
