const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    naverId: {
        type: String,
        required: true,
        unique: true
    },

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    profileImage: {
        type: String,
        default: null
    },

    status: {
        type: String,
        enum: ['active', 'deleted'],
        default: 'active'
    },

}, {
    timestamps: true
});

// 인덱스
userSchema.index({ naverId: 1 });
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);