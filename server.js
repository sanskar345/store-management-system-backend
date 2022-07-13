process.on('uncaughtException', err => {
    console.log(err.name , err.message);
    console.log('Uncaught Rejection shutting down');
    process.exit(1);

});

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => console.log('Db connected successfully'));


const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log('Listening at port 3000');
});

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('Unhandled Rejection shutting down');
    server.close(() => {
        process.exit(1);
    });
});

process.on('SIGTERM', () => {
    console.log('SIGTERM Received shutting down gracefully');
    server.close(() => {
        console.log('Process Terminated');
    });
})