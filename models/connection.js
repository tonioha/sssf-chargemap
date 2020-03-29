const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const connectionSchema = new Schema({
    Quantity: Number,
    ConnectionTypeID: {
        type: Schema.Types.ObjectId,
        ref: 'ConnectionType'},
    LevelID: {
        type: Schema.Types.ObjectId,
        ref: 'Level'},
    CurrentTypeID: {
        type: Schema.Types.ObjectId,
        ref: 'CurrentType'}
});

module.exports = mongoose.model('Connection', connectionSchema);
