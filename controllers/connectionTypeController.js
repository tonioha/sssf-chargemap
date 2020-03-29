'use strict';
const connectionTypeModel = require('../models/connectiontype');

const connectionType_list_get = async (req, res) => {
    try {
        const connectionTypes = await connectionTypeModel.find();
        await res.json(connectionTypes);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

const connectionType_get = async (req, res) => {
    try {
        const connectionType = await connectionTypeModel.findById(req.params.id);
        res.json(connectionType);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

const connectionType_post = async (req, res) => {
    let errors = [];

    if (!req.body.name) { errors.push("No name given")};
    if (!req.body.title) { errors.push("No title given")};

    if (errors.length) {
        res.status(400).json({ "error":errors.join(", ")});
        return;
    }
    const conType = await connectionTypeModel.create({
        FormalName: req.body.name,
        Title: req.body.title
    });
    res.send(`Connection type created with name: ${conType.FormalName}`);
};

module.exports = {
    connectionType_list_get,
    connectionType_get,
    connectionType_post,
};