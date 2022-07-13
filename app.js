// const path = require('path');
const helmet = require('helmet');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const cors = require('cors');


const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const itemsRouter = require('./routes/itemRoutes');
const itemCategoryRouter = require('./routes/itemCategoryRoutes');
const transactionRouter = require('./routes/transactionRoutes');
const customerRouter = require('./routes/cutomerRoutes');
const userRouter = require('./routes/userRoutes');
const storeRouter = require('./routes/storeRoutes');
const otpRouter = require('./routes/otpRoutes');

const app = express();

// app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES

app.use(cors({
  origin: 'https://sanskar345.github.io'
}));

app.options('*', cors({
  origin: 'https://sanskar345.github.io'
}));

//set security HTTP headers
app.use(helmet());

//devlopment logging

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Rate limitter

const limitter = rateLimit({
  max: 350,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
})

app.use('/api', limitter);

//Body parser reading  data from body into req.body
app.use(express.json({ limit: '10kb'}));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent Parameter Pollution
app.use(hpp({
  whitelist: [
    'quantity',
    'credit',
    'mobileNumber',
    'name',
    'partyName',
    'partyMobileNumber',
    'invoiceOrBillNumber'
  ]
}));

// compression

app.use(compression());

//test middleware

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2) ROUTES

app.use('/api/v1/otp', otpRouter);
app.use('/api/v1/items', itemsRouter);
app.use('/api/v1/itemCategory', itemCategoryRouter);
app.use('/api/v1/transactions', transactionRouter);
app.use('/api/v1/customers', customerRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/store', storeRouter);


app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
