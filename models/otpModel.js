const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const otpSchema = new mongoose.Schema({
    otp: {
        type: String,
        required: [true, 'OTP must have a otp'],
        trim: true,
        // unique: true,
    },
    // expirationTime: {
    //     type: Date,
    //     trim: true,
    //     required: [true, 'OTP must have a expirationTime'],
    // },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }
});


otpSchema.pre('save', async function(next) {
    if(!this.isModified('otp')) return next();

    this.otp = await bcrypt.hash(this.otp, 12);
    next();
});

otpSchema.methods.correctOtp = async function(candidateOtp, userOtp) {
    return await bcrypt.compare(candidateOtp, userOtp);
}

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
