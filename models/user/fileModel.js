const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    files: [{
        path: {
            type: String,
            required: true
        },
        size: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model("File", fileSchema);
