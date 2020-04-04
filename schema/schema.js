const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLList,
    GraphQLSchema,
    GraphQLNonNull,
    GraphQLBoolean,
    GraphQLInt,
    GraphQLFloat,
    GraphQLInputObjectType
} = require('graphql');

const connection = require('../models/connection');
const connectionType = require('../models/connectiontype');
const currentType = require('../models/currenttype');
const levelType = require('../models/leveltype');
const station = require('../models/station');
const statController = require('../controllers/stationController');

const gLevel = new GraphQLObjectType({
    name: 'level',
    description: 'Current level',
    fields: () => ({
        id: {type: GraphQLID},
        Comments: {type: GraphQLString},
        IsFastChargeCapable: {type: GraphQLBoolean},
        Title: {type: GraphQLString}
    })
});

const gCurrentType = new GraphQLObjectType({
    name: 'currentType',
    description: 'Current type',
    fields: () => ({
        id: {type: GraphQLID},
        Description: {type: GraphQLString},
        Title: {type: GraphQLString}
    })
});

const gConnectionType = new GraphQLObjectType({
    name: 'connectionType',
    description: 'Connection type',
    fields: () => ({
        id: {type: GraphQLID},
        FormalName: {type: GraphQLString},
        Title: {type: GraphQLString}
    })
});

const gConnection = new GraphQLObjectType({
    name: 'connection',
    description: 'Connection',
    fields: () => ({
        id: {type: GraphQLID},
        ConnectionType: {
            type: gConnectionType,
            resolve: async (parent, args) => {
                try {
                    return await connectionType.findById(parent.ConnectionTypeID);
                } catch (err) {
                    return new Error(err.message);
                }
            }
        },
        Level: {
            type: gLevel,
            resolve: async (parent, args) => {
                try {
                    return await levelType.findById(parent.LevelID);
                } catch (err) {
                    return new Error(err.measure);
                }
            }
        },
        CurrentType: {
            type: gCurrentType,
            resolve: async (parent, args) => {
                try {
                    return await currentType.findById(parent.CurrentTypeID);
                } catch (err) {
                    return new Error(err.message);
                }
            }
        },
        Quantity: {type: GraphQLInt}
    })
});

const gStation = new GraphQLObjectType({
    name: 'station',
    description: 'Station',
    fields: () => ({
        id: {type: GraphQLID},
        Title: {type: GraphQLString},
        AddressLine1: {type: GraphQLString},
        Town: {type: GraphQLString},
        StateOrProvince: {type: GraphQLString},
        Postcode: {type: GraphQLString},
        Location: {
            type: new GraphQLObjectType({
                name: 'Location',
                fields: () => ({
                    type: {type: GraphQLString},
                    coordinates: {type: new GraphQLList(GraphQLFloat)}
                })
            })
        },
        Connections: {
            type: new GraphQLList(gConnection),
            resolve: async (parent, args) => {
                try {
                    return await connection.find({_id: parent.Connections});
                } catch (err) {
                    return new Error(err.message);
                }
            }
        }
    })
});

const inputCoord = new GraphQLInputObjectType({
    name: 'Coordinate',
    fields: () => ({
        lng: {type: GraphQLFloat},
        lat: {type: GraphQLFloat}
    })
});

const inputConn = new GraphQLInputObjectType({
    name: 'inputConn',
    fields: () => ({
        Quantity: {type: GraphQLInt},
        ConnectionTypeID: {type: GraphQLID},
        LevelID: {type: GraphQLID},
        CurrentTypeID: {type: GraphQLID}
    })
});

const inputLocation = new GraphQLInputObjectType({
    name: 'inputLocation',
    fields: () => ({
        type: {type: GraphQLString},
        coordinates: {type: GraphQLList(GraphQLFloat)}
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    description: 'Main Query',
    fields: {
        stations: {
            type: new GraphQLList(gStation),
            description: 'Get all stations',
            args: {
                start: {type: GraphQLInt},
                limit: {type: GraphQLInt},
                topRight: {type: inputCoord},
                bottomLeft: {type: inputCoord}
            },
            resolve: async (parent, args) => {
                try {
                    return statController.station_list_get(args);
                } catch (err) {
                    return new Error(err.message);
                }
            }
        },
        station: {
            type: gStation,
            description: 'Get station by id',
            args: {
                id: {type: GraphQLNonNull(GraphQLID)}
            },
            resolve: async (parent, args) => {
                try {
                    return await statController.station_get(args.id);
                } catch (err) {
                    return new Error(err.message);
                }
            }
        },
        connectiontypes: {
            type: new GraphQLList(gConnectionType),
            description: 'Get all connection types',
            resolve: async (parent, args) => {
                try {
                    return await connectionType.find();
                } catch (err) {
                    return new Error(err.message);
                }
            }
        },
        currenttypes: {
            type: new GraphQLList(gCurrentType),
            description: 'Get all current types',
            resolve: async (parent, args) => {
                try {
                    return await currentType.find();
                } catch (err) {
                    return new Error(err.message);
                }
            }
        },
        leveltypes: {
            type: new GraphQLList(gLevel),
            description: 'Get all level types',
            resolve: async (parent, args) => {
                try {
                    return await levelType.find();
                } catch (err) {
                    return new Error(err.message);
                }
            }
        }
    }
});

const Mutation = new GraphQLObjectType({
    name: 'MutationType',
    description: 'Mutations...',
    fields: {
        addStation: {
            type: gStation,
            description: 'Add station',
            args: {
                Postcode: {type: GraphQLString},
                Title: {type: GraphQLString},
                AddressLine1: {type: GraphQLString},
                StateOrProvince: {type: GraphQLString},
                Town: {type: GraphQLString},
                Connections: {
                    type: new GraphQLNonNull(new GraphQLList(inputConn))
                },
                Location: {type: inputLocation}
            },
            resolve: async (parent, args, {req, res, checkAuth}) => {
                try {
                    checkAuth(req, res);
                    const conn = new connection(args.Connections[0]);
                    conn.save();
                    args.Connections = conn;
                    const newstation = new station(args);
                    return await newstation.save();
                } catch (err) {
                    return new Error(err.message);
                }
            }
        },

    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});