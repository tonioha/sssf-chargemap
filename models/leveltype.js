const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const levelTypeSchema = new Schema({
    Comments: String,
    IsFastChargeCapable: Boolean,
    Title: String
});

module.exports = mongoose.model('Level', levelTypeSchema);