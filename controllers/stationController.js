'use strict';
const stationModel = require('../models/station');
const connectionModel = require('../models/connection');
const connectionTypeModel = require('../models/connectiontype');
const levelTypeModel = require('../models/leveltype');
const currentTypeModel = require('../models/currenttype');

const station_list_get = async (req, res) => {
    let skip = 0;
    let limit = 10;
    let topRight, bottomLeft;
    let query = {};

    if (req.query.topRight && req.query.bottomLeft) {
        topRight = JSON.parse(req.query.topRight);
        bottomLeft = JSON.parse(req.query.bottomLeft);
        query = {
            'Location':
                {
                    '$geoWithin':
                        {
                            '$geometry':
                                {
                                    'type': 'Polygon',
                                    'coordinates': [[[bottomLeft.lng, topRight.lat],
                                        [topRight.lng, topRight.lat],
                                        [topRight.lng, bottomLeft.lat],
                                        [bottomLeft.lng, bottomLeft.lat],
                                        [bottomLeft.lng, topRight.lat]
                                    ]]
                                }
                        }
                }
        };
    }

    skip = parseInt(req.query.start);
    limit = parseInt(req.query.limit);

    try {
        const stations = await stationModel.find(query).populate({
            path: "Connections",
            populate: [
                {path: "ConnectionTypeID"},
                {path: "LevelID"},
                {path: "CurrentTypeID"}
            ]
        }).skip(skip).limit(limit);
        await res.json(stations);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

const station_get = async (req, res) => {
  try {
    const station = await stationModel.findById(req.params.id).populate({
        path: "Connections",
        populate: [
            {path: "ConnectionTypeID"},
            {path: "LevelID"},
            {path: "CurrentTypeID"}
        ]
    });
    res.json(station);
  } catch (err) {
    res.status(500).json({message: err.message});
  }
};

const station_post = async (req, res) => {
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
    const station = await stationModel.create({
        Title: req.body.stationtitle,
        AddressLine1: req.body.address,
        Town: req.body.town,
        StateOrProvince: req.body.state,
        Postcode: req.body.postcode,
        Connections: connection,
        Location: {
            coordinates: [req.body.lon, req.body.lat],
            type: "Point"
        }
    });

    res.send(`Station created with id: ${station._id}`);
};

const station_put = async (req, res) => {
    const filter = {_id: req.params.id};
    const update = req.body;

    let updatedStation = await stationModel.findOneAndUpdate(filter, update, {new: true});

    console.log(req.body);
    console.log(updatedStation);

    res.send(`Updated station with id: ${updatedStation._id}`);
};

const station_delete = async (req, res) => {
    try {
        await stationModel.findByIdAndDelete(req.params.id);
        res.send(`Succesfully deleted station with id: ${req.params.id}`);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

module.exports = {
    station_list_get,
    station_get,
    station_post,
    station_delete,
    station_put,
};
