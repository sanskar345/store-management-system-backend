const AppError = require('../utils/appError');

const handleCastErrorDB = error => {
    const message = `Invalid ${error.path}: ${error.value}`;
    return new AppError(message, 400);
}

const handleDuplicateFieldsErrorDB = error => {
    const value = error.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    const message = `Duplicate field value ${value}.Please use another value.`
    return new AppError(message, 400);
}

const handleValidationErrorDB = error => {
    const errors = Object.values(error.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const handleJsonWebTokenError = () => new AppError('Invalid Token, please login again!', 401);
const handleTokenExpiredError = () => new AppError('Token is expired, please login again!', 401);

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack,
      });
};  

const sendErrorProd = (err, res) => {
    // for operational error
    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }

    // for programming and unknown error
    else if(!err.isOperational){
        //log error
        console.error(err);

        //send error
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong'
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err, res);
    }
    else if(process.env.NODE_ENV === 'production'){
        let error = err;
        if(error.name === 'CastError') error = handleCastErrorDB(error);
        if(error.code === 11000) error = handleDuplicateFieldsErrorDB(error);
        if(error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if(error.name === 'JsonWebTokenError') error = handleJsonWebTokenError();
        if(error.name === 'TokenExpiredError') error = handleTokenExpiredError();
        sendErrorProd(error, res);
    }
    
  };

