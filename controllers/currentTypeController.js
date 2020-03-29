'use strict';
const currentTypeModel = require('../models/currenttype');

const currentType_list_get = async (req, res) => {
    try {
        const currentTypes = await currentTypeModel.find();
        await res.json(currentTypes);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

const currentType_get = async (req, res) => {
    try {
        const currentType = await currentTypeModel.findById(req.params.id);
        res.json(currentType);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

const currentType_post = async (req, res) => {
    let errors = [];

    if (!req.body.description) { errors.push("No description given")};
    if (!req.body.title) { errors.push("No title given")};

    if (errors.length) {
        res.status(400).json({ "error":errors.join(", ")});
        return;
    }

    const currentType = await currentTypeModel.create({
        Description: req.body.description,
        Title: req.body.title
    });
    res.send(`Current Type created with id: ${currentType._id}`);
};

module.exports = {
    currentType_list_get,
    currentType_get,
    currentType_post,
};
