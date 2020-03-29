'use strict';
const connectionModel = require('../models/connection');
const connectionTypeModel = require('../models/connectiontype');
const levelTypeModel = require('../models/leveltype');
const currentTypeModel = require('../models/currenttype');

const connection_list_get = async (req, res) => {
    try {
        const connections = await connectionModel.find().populate([
            {path: "ConnectionTypeID"},
            {path: "LevelID"},
            {path: "CurrentTypeID"}
        ]);
        await res.json(connections);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

const connection_get = async (req, res) => {
    try {
        const connection = await connectionModel.findById(req.params.id);
        res.json(connection);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

const connection_post = async (req, res) => {
    const connType = await connectionTypeModel.create({
        FormalName: req.body.name,
        Title: req.body.connectiontypetitle
    });
    const lvlType = await levelTypeModel.create({
        Comments: req.body.comments,
        IsFastChargeCapable: req.body.capability,
        Title: req.body.leveltitle
    });
    const currType = await currentTypeModel.create({
        Description: req.body.description,
        Title: req.body.currenttitle
    });
    const connection = await connectionModel.create({
        ConnectionTypeID: connType,
        LevelID: lvlType,
        CurrentTypeID: currType,
        Quantity: req.body.quantity
    });

    res.send(`Connection created with id: ${connection._id} quantity: ${connection.Quantity}`);
};

module.exports = {
    connection_list_get,
    connection_get,
    connection_post,
};
