const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const Otp = require('../models/otpModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const {encode, decode} = require('../utils/crypto');

const signJWTTokenForOtp = (id) => jwt.sign({ id: id }, process.env.JSON_SECRET_FOR_OTP, {
    expiresIn: process.env.JSON_EXPIRES_IN_FOR_OTP
});

exports.generateOtp = catchAsync( async(req, res, next) => {
    

    const {email, name} = req.body;

    if(!email){
        return next(new AppError('Email does not exists', 400));
    }
    if(!name){
        return next(new AppError('Name does not exists', 400));
    }


    //Generate OTP 
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false, digits: true });


    //create otp in database

    const newOtp = await Otp.create({
        otp: otp,
    })

    const otpToken = signJWTTokenForOtp(newOtp._id);

    // Create details object containing the email and otp id

    const details = {
        "email": email,
        "token": otpToken,
        "message":"OTP sent to user",
    }

    // Encrypt the details object
    
    const encryptedData = await encode(JSON.stringify(details))

    const url = otp;
    const user = {
        email,
        name
    }

    try{
        await new Email(user, url).sendOtp();
        
            res.status(200).json({
                status: 'success',
                details: encryptedData
            });

    } catch(err) {
        // console.log(err);

        await Otp.findByIdAndDelete(newOtp._id);
        return next(new AppError('There was error sending the email, please try again later!', 500));
    }



});

exports.verifyOtp = catchAsync( async(req, res, next) => {
    const {token, otp, check} = req.body;    

    if(!token){
        return next(new AppError('Token not provided', 400));
    }
    if(!otp){
        return next(new AppError('OTP not provided', 400));
    }
    if(!check){
        return next(new AppError('Check not provided', 400));
    }

    // decrypt details


    let decryptedData;

    //Check if verification key is altered or not and store it in variable decoded after decryption
    try{
        decryptedData = await decode(token);
    }
    catch(err) {
        return next(new AppError('Bad Request', 400));
    }

    const details = JSON.parse(decryptedData);

    // check if otp was sent to same email

    if(details.email !== check){
        return next(new AppError('OTP was not sent to this particular email', 400));
    }

    //verification of token
    const decoded = await promisify(jwt.verify)(details.token, process.env.JSON_SECRET_FOR_OTP);

    //check if user exists
    const availableOtp = await Otp.findById(decoded.id);

    if(!availableOtp){
        return next(new AppError('Invalid Otp', 401));
    }

    if(!(await availableOtp.correctOtp(otp, availableOtp.otp))){
        return next(new AppError('Invalid Otp', 401));
    }

    const deletedOtp = await Otp.findByIdAndDelete(availableOtp._id);

    if(!deletedOtp){
        return next(new AppError('Cannot find Otp with this id to delete', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Otp matched and verified',
        check
    });

});