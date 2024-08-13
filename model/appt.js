const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    patientName: {
        type: String,
        required: false
    },
    providerName: {
        type: String,
        required: false
    },
    speciality: {
        type: String,
        required: false
    },
    date: {
        type: String,
        required: false
    },
    time: {
        type: String,
        required: false
    },
    contactNumber: { 
        type: String,
        required: false
    },
    bookingId: { 
        type: String,
        required: false
    }
}, { versionKey: false });

const userModel = mongoose.model('appointments', userSchema);

module.exports = userModel;
