const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const planSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    user: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    cost: {
        type: Number,
        required: true,
    },
    planType: {
        type: String,
        required: true,
        enum: ['FREE', 'MONTHLY', 'YEARLY']
    },
    allocatedSpace: {
        type: Number,
        required: true,
    },
    usedSpace: {
        type: String,
        default: 0
    },
    availableSpace:{
        type: String,
        default: 0
    },
    planImage: {
        type: String,
    },
    passwordLimit: {
        type: Number,
        default: 0,
        require:true
    },
    familyAndFriendsLimit: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);
