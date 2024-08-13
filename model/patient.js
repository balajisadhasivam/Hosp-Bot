const mongoose = require('mongoose');

const patientSchema = mongoose.Schema({
    patientName: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    contactNo: {
        type: String,
        required: true
    }
}, { versionKey: false });

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
