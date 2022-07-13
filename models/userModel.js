const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: [4, 'Name must have minimum of 4 characters'],
        maxlength: [40, 'Name can have maximum of 40 characters'],
        // required: [true, 'user must have a name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'user must have a email'],
        validate: [validator.isEmail, 'email must be a in email format'],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'user must have a password'],
        minlength: [8, 'Password must have minimum of 8 characters'],
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, 'user must have a confirmPassword'],
        validate: {
            validator: function(el) {
                return this.password === el;
            },
            message: 'Password and confirm password must match'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    passwordChangedAt: {
        type: Date
    },
    passwordResetToken: String,
    passwordResetExpires: Date
    
});

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;

    next();
});

userSchema.pre('save', function(next) {
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
} 

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if(this.passwordChangedAt){
        const passwordChangedAtTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10); 
        return JWTTimestamp < passwordChangedAtTimeStamp; //100 < 90
    }

    return false;
}

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;