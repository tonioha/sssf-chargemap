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
const connectiontype = require('../models/connectiontype');
const currenttype = require('../models/currenttype');
const level = require('../models/leveltype');
const station = require('../models/station');
const user = require('../models/userModel');
const authController = require('../controllers/authController');
const rectangleBounds = require('../utils/rectangleBounds');
const bcrypt = require('bcrypt');
const saltRound = 12;

const userType = new GraphQLObjectType({
    name: 'user',
    fields: () => ({
        id: {type: GraphQLID},
        full_name: {type: GraphQLString},
        username: {type: GraphQLString},
        token: {type: GraphQLString},
    }),
});

const geoJSONType = new GraphQLObjectType({
    name: 'geoJSON',
    fields: () => ({
        type: {type: GraphQLString},
        coordinates: {type: new GraphQLList(GraphQLFloat)},
    }),
});

const connectiontypeType = new GraphQLObjectType({
    name: 'connectiontype',
    fields: () => ({
        id: {type: GraphQLID},
        FormalName: {type: GraphQLString},
        Title: {type: GraphQLString},
    }),
});

const currenttypeType = new GraphQLObjectType({
    name: 'currenttype',
    fields: () => ({
        id: {type: GraphQLID},
        Description: {type: GraphQLString},
        Title: {type: GraphQLString},
    }),
});

const levelType = new GraphQLObjectType({
    name: 'level',
    fields: () => ({
        id: {type: GraphQLID},
        Comments: {type: GraphQLString},
        IsFastChargeCapable: {type: GraphQLBoolean},
        Title: {type: GraphQLString},
    }),
});

const stationType = new GraphQLObjectType({
    name: 'station',
    fields: () => ({
        id: {type: GraphQLID},
        Connections: {
            type: new GraphQLList(connectionType),
            resolve(parent, args) {
                return connection.find({_id: {$in: parent.Connections}});
            },
        },
        Title: {type: GraphQLString},
        AddressLine1: {type: GraphQLString},
        Town: {type: GraphQLString},
        StateOrProvince: {type: GraphQLString},
        Postcode: {type: GraphQLString},
        Location: {type: geoJSONType},
    }),
});

const connectionType = new GraphQLObjectType({
    name: 'connection',
    fields: () => ({
        id: {type: GraphQLID},
        ConnectionType: {
            type: connectiontypeType,
            resolve(parent, args) {
                return connectiontype.findById(parent.ConnectionTypeID);
            },
        },
        LevelType: {
            type: levelType,
            resolve(parent, args) {
                return level.findById(parent.LevelID);
            },
        },
        CurrentType: {
            type: currenttypeType,
            resolve(parent, args) {
                return currenttype.findById(parent.CurrentTypeID);
            },
        },
        Quantity: {type: GraphQLInt},
    }),
});

// custom input object
const LatLng = new GraphQLInputObjectType({
    name: 'LatLng',
    description: 'Object containing latitude and longitude',
    fields: () => ({
        lat: {type: GraphQLFloat},
        lng: {type: GraphQLFloat},
    }),
});

// custom input object
const Bounds = new GraphQLInputObjectType({
    name: 'Bounds',
    description: 'Opposite corners of rectangular area on map',
    fields: () => ({
        _southWest: {type: LatLng},
        _northEast: {type: LatLng},
    }),
});

// custom input object
const InputConnection = new GraphQLInputObjectType({
    name: 'InputConnection',
    description: 'Connection type, level, current and quantity',
    fields: () => ({
        ConnectionTypeID: {type: new GraphQLNonNull(GraphQLID)},
        LevelID: {type: new GraphQLNonNull(GraphQLID)},
        CurrentTypeID: {type: new GraphQLNonNull(GraphQLID)},
        Quantity: {type: new GraphQLNonNull(GraphQLInt)},
    }),
});

// custom input object
const ModifyConnection = new GraphQLInputObjectType({
    name: 'ModifyConnection',
    description: 'Connection type, level, current and quantity',
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLID)},
        ConnectionTypeID: {type: GraphQLID},
        LevelID: {type: GraphQLID},
        CurrentTypeID: {type: GraphQLID},
        Quantity: {type: GraphQLInt},
    }),
});

// custom input object
const InputGeoJSONType = new GraphQLInputObjectType({
    name: 'Location',
    description: 'Location as array, longitude first',
    fields: () => ({
        type: {type: GraphQLString, defaultValue: 'Point'},
        coordinates: {type: new GraphQLNonNull(new GraphQLList(GraphQLFloat))},
    }),
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        station: {
            type: stationType,
            description: 'Get station by id',
            args: {id: {type: GraphQLID}},
            resolve(parent, args) {
                return station.findById(args.id);
            },
        },
        stations: {
            type: new GraphQLList(stationType),
            description: 'Get all stations',
            args: {
                bounds: {type: Bounds},
                limit: {type: GraphQLInt, defaultValue: 10},
                start: {type: GraphQLInt},
            },
            resolve: (parent, args) => {
                if (args.bounds) { // if bounds arg is in query
                    const mapBounds = rectangleBounds(args.bounds._northEast,
                        args.bounds._southWest);
                    return station.find(({
                        Location: {
                            $geoWithin: {  // geoWithin is built in mongoose, https://mongoosejs.com/docs/geojson.html
                                $geometry: mapBounds,
                            },
                        },
                    }));
                } else { // if no args or start or limit
                    return station.find().skip(args.start).limit(args.limit);
                }
            },
        },
        connectiontypes: {
            type: new GraphQLList(connectiontypeType),
            description: 'Connection types for connections',
            resolve: (parent, args) => {
                return connectiontype.find();
            },
        },
        currenttypes: {
            type: new GraphQLList(currenttypeType),
            description: 'Current types for connections',
            resolve: (parent, args) => {
                return currenttype.find();
            },
        },
        leveltypes: {
            type: new GraphQLList(levelType),
            description: 'Level types for connections',
            resolve: (parent, args) => {
                return level.find();
            },
        },
        user: {
            type: userType,
            description: 'Get user by token, authentication required.',
            resolve: async (parent, args, {req, res}) => {
                try {
                    const result = await authController.checkAuth(req, res);
                    result.token = 'you have it already';
                    return result;
                }
                catch (err) {
                    throw new Error(err);
                }
            },
        },
        login: {
            type: userType,
            description: 'Login with username and password to receive token.',
            args: {
                username: {type: new GraphQLNonNull(GraphQLString)},
                password: {type: new GraphQLNonNull(GraphQLString)},
            },
            resolve: async (parent, args, {req, res}) => {
                req.body = args; // inject args to reqest body for passport
                try {
                    const authResponse = await authController.login(req, res);
                    return {
                        id: authResponse.user._id,
                        ...authResponse.user,
                        token: authResponse.token,
                    };
                }
                catch (err) {
                    throw new Error(err);
                }
            },
        },
    },
});

const Mutation = new GraphQLObjectType({
    name: 'MutationType',
    fields: () => ({
        addStation: {
            type: stationType,
            description: 'Add station, authentication required.',
            args: {
                Connections: {
                    type: new GraphQLNonNull(new GraphQLList(InputConnection)),
                },
                Title: {type: new GraphQLNonNull(GraphQLString)},
                AddressLine1: {type: new GraphQLNonNull(GraphQLString)},
                Town: {type: new GraphQLNonNull(GraphQLString)},
                StateOrProvince: {type: GraphQLString},
                Postcode: {type: new GraphQLNonNull(GraphQLString)},
                Location: {type: InputGeoJSONType},
            },
            resolve: async (parent, args, {req, res}) => {
                try {
                    await authController.checkAuth(req, res);
                    const conns = await Promise.all(args.Connections.map(async conn => {
                        let newConnection = new connection(conn);
                        const result = await newConnection.save();
                        return result._id;
                    }));

                    let newStation = new station({
                        ...args,
                        Connections: conns,
                    });
                    return newStation.save();
                }
                catch (err) {
                    throw new Error(err);
                }
            },
        },
        modifyStation: {
            type: stationType,
            description: 'Modify station, authentication required.',
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)},
                Connections: {
                    type: new GraphQLList(ModifyConnection),
                },
                Title: {type: GraphQLString},
                AddressLine1: {type: GraphQLString},
                Town: {type: GraphQLString},
                StateOrProvince: {type: GraphQLString},
                Postcode: {type: GraphQLString},
            },
            resolve: async (parent, args, {req, res}) => {
                try {
                    await authController.checkAuth(req, res);
                    const conns = await Promise.all(args.Connections.map(async conn => {
                        const result = await connection.findByIdAndUpdate(conn.id, conn,
                            {new: true});
                        return result;
                    }));

                    let newStation = {
                        Title: args.Title,
                        AddressLine1: args.AddressLine1,
                        Town: args.Town,
                        StateOrProvince: args.StateOrProvince,
                        Postcode: args.Postcode,
                    };
                    return await station.findByIdAndUpdate(args.id, newStation,
                        {new: true});
                }
                catch (err) {
                    throw new Error(err);
                }
            },
        },
        deleteStation: {
            type: stationType,
            description: 'Delete station, authentication required.',
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)},
            },
            resolve: async (parent, args, {req, res}) => {
                try {
                    authController.checkAuth(req, res);
                    // delete connections
                    const stat = await station.findById(args.id);
                    const delResult = await Promise.all(
                        stat.Connections.map(async (conn) => {
                            return await connection.findByIdAndDelete(conn._id);
                        }));
                    const result = await station.findByIdAndDelete(args.id);
                    return result;
                }
                catch (err) {
                    throw new Error(err);
                }
            },
        },
        registerUser: {
            type: userType,
            description: 'Register user.',
            args: {
                username: {type: new GraphQLNonNull(GraphQLString)},
                password: {type: new GraphQLNonNull(GraphQLString)},
                full_name: {type: new GraphQLNonNull(GraphQLString)},
            },
            resolve: async (parent, args, {req, res}) => {
                try {
                    const hash = await bcrypt.hash(args.password, saltRound);
                    const userWithHash = {
                        ...args,
                        password: hash,
                    };
                    const newUser = new user(userWithHash);
                    const result = await newUser.save();
                    if (result !== null) {
                        // automatic login
                        req.body = args; // inject args to request body for passport
                        const authResponse = await authController.login(req, res);
                        return {
                            id: authResponse.user._id,
                            ...authResponse.user,
                            token: authResponse.token,
                        };
                    } else {
                        throw new Error('insert fail');
                    }
                }
                catch (err) {
                    throw new Error(err);
                }
            },
        },
    }),
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
});
