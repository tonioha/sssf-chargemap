// https://docs.mongodb.com/manual/core/2dsphere/

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const stationSchema = new Schema({
    Title: String,
    AddressLine1: String,
    Town: String,
    StateOrProvince: String,
    Postcode: String,
    Connections: [{type: Schema.Types.ObjectId, ref: 'Connection'}],
    Location: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            require: true
        }
    }
});

module.exports = mongoose.model('Station', stationSchema);
