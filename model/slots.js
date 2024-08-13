const mongoose = require('mongoose');

const slotSchema = mongoose.Schema({
    providerId: {
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
    bookedStatus: {
        type: Boolean,
        required: false
    }
}, { versionKey: false });

const Slot = mongoose.model('slotDetails', slotSchema);

module.exports = Slot;
