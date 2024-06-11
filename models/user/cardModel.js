const mongoose = require('mongoose');
const crypto = require('crypto');

const cardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cardHolderName: {
        type: String,
        required: true
    },
    expirationDate: {
        type: String,
        required: true,
        match: /^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/
    },
    encryptedCardNumber: {
        type: String,
        required: true
    },
    encryptedCardNumberIV: {
        type: String,
        required: true
    },
    encryptedCvv: {
        type: String,
        required: true
    },
    encryptedCvvIV: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Card', cardSchema);
