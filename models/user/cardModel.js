const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const cardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cardNumber: {
        type: String,
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
    cvv: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 4
    },
    encryptedCardNumber: {
        type: String,
        required: true
    }
}, { timestamps: true });

cardSchema.pre('save', async function(next) {
    if (this.isModified('cardNumber')) {
        const salt = await bcrypt.genSalt(10);
        this.encryptedCardNumber = await bcrypt.hash(this.cardNumber, salt);
        this.cardNumber = undefined;  
    }
    next();
});

module.exports = mongoose.model('Card', cardSchema);
