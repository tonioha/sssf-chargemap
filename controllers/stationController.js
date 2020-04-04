'use strict';
const stationModel = require('../models/station');

const station_list_get = async (req, res) => {
    let skip = 0;
    let limit = 10;
    let topRight, bottomLeft;
    let query = {};


    if (req.topRight && req.bottomLeft) {
        topRight = req.topRight;
        bottomLeft = req.bottomLeft;
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

    skip = parseInt(req.start);
    limit = parseInt(req.limit);

    try {
        const stations = await stationModel.find(query).populate({
            path: "Connections",
            populate: [
                {path: "ConnectionTypeID"},
                {path: "LevelID"},
                {path: "CurrentTypeID"}
            ]
        }).skip(skip).limit(limit);
        return stations;
    } catch (err) {
        return new Error(err.message);
    }
};

const station_get = async (req, res) => {
  try {
    const station = await stationModel.findById(req).populate({
        path: "Connections",
        populate: [
            {path: "ConnectionTypeID"},
            {path: "LevelID"},
            {path: "CurrentTypeID"}
        ]
    });
    return station;
  } catch (err) {
    return new Error(err.message);
  }
};

module.exports = {
    station_list_get,
    station_get
};
