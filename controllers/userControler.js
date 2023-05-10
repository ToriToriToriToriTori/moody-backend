
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');

const User = require('../models/user');

const signup = async (req, res, next) => {

    const {name, email, password, image} = req.body;
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12); 
    } catch (er) {
        console.log(er);
        const error = new Error('Cannot save user');
        error.code = 500;
        return next(error);
    }
    const createdUser = User({
        name,
        email,
        password: hashedPassword,
        image,
        emotions: []
    });

    let token;

    try {
        await createdUser.save();
        token = jwt.sign({userId: createdUser.id, name: createdUser.name}, 'supersecret', {expiresIn: '1h'});
    } catch (er) {
        if(er.keyPattern && JSON.stringify(Object.keys(er.keyPattern)) === JSON.stringify(['email']) && er.keyPattern.email === 1){
            const error = new Error('User with such email already exist');
            error.code = 422;
            return next(error);
        }
        console.log(er);
        const error = new Error('Cannot save user');
        error.code = 500;
        return next(error);
    }   
    

    res.status(201).json({userId: createdUser.id, name: createdUser.name, token: token});
}

const login = async (req, res, next) => {
    const {email, password}  = req.body;
    
    let loggedUser;

    try {
        loggedUser = await User.findOne({email: email});
    } catch (err) {
        const error = new Error('Cannot connect to database');
        error.code = 500;
        return next(error);
    }
    
    if(!loggedUser){
        const error = new Error('User is not found or password is incorrect');
        error.code = 404;
        return next(error);
    }

    let isValidPassword = false;
    try{
        isValidPassword = await bcrypt.compare(password, loggedUser.password);
    }
    catch(err){
        const error = new Error('Invalid password');
        error.code = 401;
        return next(error);
    }
    if(!isValidPassword){
        const error = new Error('Invalid password');
        error.code = 401;
        return next(error);
    }

    let token;

    try {
        token = jwt.sign({userId: loggedUser.id, name: loggedUser.name}, 'supersecret', {expiresIn: '1h'});
    } catch (err) {
        const error = new Error('Cannot save user');
        error.code = 500;
        return next(error);
    }

    res.json({userId: loggedUser.id, name: loggedUser.name, token: token});
}

const getUserById = async (req, res, next) => {

    const userId = req.params.uid;
    let user;
    try {
        user = await User.findById(userId);
    } catch (err) {
        const error = new Error(err.message);
        error.code = 500;
        return next(error);
    }
     if(user == null){
        const error = new Error('User not found');
        error.code = 404;
        return next(error);
    }
    
    res.json({user: user.toObject()});
}

exports.signup = signup;
exports.login = login;
exports.getUserById = getUserById; 