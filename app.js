const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const cors = require('cors');

const usersRouter = require('./routes/users');
const emotionsRouter = require('./routes/emotions');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000'
  }));

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
});

app.use('/api/users', usersRouter);

app.use('/api/emotions', emotionsRouter);

app.use((req, res, next) => {
    const error = new Error('Not founded route');
    error.code = 404;
    throw error; 
});

app.use((error, req, res, next) =>
{
    if (res.headerSent){
        return next(error);
    }
    res.status(error.code || 500);
    res.json({message:error.message || 'An unknows error occured!'});
});

mongoose.connect('mongodb+srv://moodsback:8LWzNlsn6Tc5hkDX@moodtracker.mjxcmsw.mongodb.net/moodboard?retryWrites=true&w=majority')
.then(() => {app.listen(5000);})
.catch(er => console.log(er, "Connecting to Mongo error"));
