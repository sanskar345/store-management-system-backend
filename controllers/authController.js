const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signJWTToken = (id) => jwt.sign({ id: id }, process.env.JSON_SECRET, {
        expiresIn: process.env.JSON_EXPIRES_IN
    });

exports.signup = catchAsync(async (req, res, next) => {

    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
    });

    const url = process.env.FRONTEND_URL;

    await new Email(newUser, url).sendWelcome();

    const token = signJWTToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    });
});

exports.login = catchAsync(async(req, res, next) => {
    const { email, password } = req.body;

    if(!email || !password){
        return next(new AppError('Email and Password does not exist', 400));
    }

    const user = await User.findOne({email}).select('+password');

    if(!user || !(await user.correctPassword(password, user.password))){
        return next(new AppError('Invalid Email or Password', 401));
    }

    const token = signJWTToken(user._id);

    res.status(200).json({
        status: 'success',
        token,
        data: {
            name: user.name,
            email: user.email,
            id: user._id
        }
    });

});

exports.protect = catchAsync(async(req, res, next) => {

    // console.log();
    
    let token;
    // get token and check if token is there

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token){
        return next(new AppError('You are not logged in please login to get access', 401));
    }

    //verification of token

    const decoded = await promisify(jwt.verify)(token, process.env.JSON_SECRET);

    // console.log(decoded);

    //check if user exists

    const currentUser = await User.findById(decoded.id);

    if(!currentUser){
        return next(new AppError('The user belonging to this token does no longer exists', 401));
    }

    //check if user changed password after the token issued

    if(currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password please login again', 401));
    }

    if(req.method === 'GET'){
        req.query.adminIdFk = decoded.id;
        req.params.adminIdFk = decoded.id;
    }
    if(req.method === 'POST'){
        //check if admin exists
        // const admin = await User.findById(req.body.adminIdFk);
        // if(!admin){
        //     return next(new AppError('Unauthorised post request', 401));
        // }
        req.body.adminIdFk = decoded.id;
    }

    req.user = currentUser;

    //grant access to protected routes

    next();
});

exports.forgotPassword = catchAsync( async(req, res, next) => {

    const {email} =  req.body
    if(!email){
        return next(new AppError('Email not provided', 400));
    }
    // get user on the basis of given email

    const user = await User.findOne({ email: req.body.email });

    if(!user){
        return next(new AppError('No user exists with this email', 404));
    };

    // generate reset password token

    const resetToken = user.createPasswordResetToken();
    user.save({ validateBeforeSave: false });

    //send token on email

    // const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const newURL = `${process.env.FRONTEND_URL}#/reset-password/${resetToken}`;
    try{

        
           await new Email(user, newURL).sendPasswordReset();
        
            res.status(200).json({
                status: 'success',
                message: 'token sent to email!'
            });
    } catch(err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.save({ validateBeforeSave: false });

        return next(new AppError('There was error sending the email, please try again later!', 500));

    }

});

exports.resetPassword = catchAsync( async(req, res, next) => {
    // get user based on the token

    const hashedToken = crypto
        .createHash('sha256')
         
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

    //check if user exists

    if(!user){
        return next(new AppError('Token is invalid or has expired', 400));
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // if everything ok send token

    const token = signJWTToken(user._id); 

    res.status(200).json({
        status: 'success',
        token
    });

});

