const mongoose = require("mongoose");
const Emotion = require('../models/emotion');
const User = require('../models/user');
const user = require('../models/user');


const getStatisticsTheMostCommonEmotion = async (req, res, next) => {
    const userId = req.params.uid;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
  
    try {
      const emotions = await Emotion.aggregate([
        { $match: { uid: new mongoose.Types.ObjectId(userId), date: { $gte: weekAgo } } },
        { $group: { _id: '$emotion', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]);
      
      if (emotions.length === 0) {
        const error = new Error('No emotions found in the last week');
        error.code = 404;
        return next(error);
      }
  
      res.json({ emotion: emotions[0]._id });
    } catch (err) {
      const error = new Error(err.message);
      error.code = 500;
      return next(error);
    }
  };

const getStatisticsTheMostCommonReason = async (req, res, next) => {
    const userId = req.params.uid;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
  
    try {
      const reasons = await Emotion.aggregate([
        { $match: { uid: new mongoose.Types.ObjectId(userId), date: { $gte: weekAgo } } },
        { $group: { _id: '$reason', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]);
  
      if (reasons.length === 0) {
        const error = new Error('No reasons found in the last week');
        error.code = 404;
        return next(error);
      }
  
      res.json({ reason: reasons[0]._id });
    } catch (err) {
      const error = new Error(err.message);
      error.code = 500;
      return next(error);
    }
};

const getStatisticsTheCauseOfNegativeEmotions = async (req, res, next) => {
    const userId = req.params.uid;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
  
    try {
      const reasons = await Emotion.aggregate([
        {
          $match: {
            uid: new mongoose.Types.ObjectId(userId),
            date: { $gte: weekAgo },
            emotion: { $in: ['SAD', 'ANGRY', 'NERVOUS'] }
          }
        },
        {
          $group: {
            _id: '$reason',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 1
        }
      ]);
  
      if (reasons.length === 0) {
        const error = new Error('No reasons found in the last week');
        error.code = 404;
        return next(error);
      }
  
      res.json({ reason: reasons[0]._id });
    } catch (err) {
      const error = new Error(err.message);
      error.code = 500;
      return next(error);
    }
  };

  
const getStatisticsTheCauseOfPositiveEmotions = async (req, res, next) => {
    const userId = req.params.uid;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
  
    try {
      const reasons = await Emotion.aggregate([
        {
          $match: {
            uid: new mongoose.Types.ObjectId(userId),
            date: { $gte: weekAgo },
            emotion: { $in: ['HAPPY', 'PLAYFUL', 'NORMAL'] }
          }
        },
        {
          $group: {
            _id: '$reason',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 1
        }
      ]);
  
      if (reasons.length === 0) {
        const error = new Error('No reasons found in the last week');
        error.code = 404;
        return next(error);
      }
  
      res.json({ reason: reasons[0]._id });
    } catch (err) {
      const error = new Error(err.message);
      error.code = 500;
      return next(error);
    }
  };

const getEmotionById = async (req, res, next) => {
    const eId = req.params.eid;

    let emo;

    try {
        emo = await Emotion.findById(eId);
    } catch (er) {
        const error = new Error(er.massage);
        error.code = 500;
        return next(error);
    }
    if(!emo){
        const error = new Error('Not founded emotion');
        error.code = 404;
        return next(error);
    }

    res.json({emo: emo.toObject()});
};

const getEmotionsByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    let emotions;
    try{
        emotions = await Emotion.find({ uid: userId });
    }
    catch (err) {
        const error = new Error(err.message);
        error.code = 500;
        return next(error);
    }

    if(!emotions || emotions.length === 0){
        const error = new Error(emotions);
        error.code = 404;
        return next(error);
    }

    res.json({emotions: emotions.map(emo => emo.toObject({getters: true}))});
};

const getEmotionsByUserIdAndDate = async (req, res, next) => {
    const userId = req.params.uid;
    const date = req.params.date;
  
    // Check if date is valid
    if (!Date.parse(date)) {
      const error = new Error('Invalid date format. Please use yyyy-mm-dd');
      error.code = 400;
      return next(error);
    }
  
    // Set start and end dates for the query
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
  
    try {
      const emotions = await Emotion.find({ uid: userId, date: { $gte: startDate, $lt: endDate } }).populate('uid', 'email');
      res.json({ emotions: emotions.map(emo => emo.toObject({ getters: true })) });
    } catch (err) {
      const error = new Error(err.message);
      error.code = 500;
      return next(error);
    }
  };

const createEmotion = async (req, res, next) =>{
    const {uid, emotion, reason, description} = req.body;

    const createdEmotion = new Emotion ({
        uid,
        emotion,
        reason,
        description,
        date: new Date()
    });

    let user;
    try {
        user = await User.findById(uid);
    } catch (er) {
        console.log('user error');
        const error = new Error('Cannot connect to database');
        error.code = 500;
        return next(error);
    }
    if (!user) {
        const error = new Error('User is not found');
        error.code = 404;
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdEmotion.save({ session: sess });
        sess.commitTransaction();
    } catch (er) {
        const error = new Error(er.message);
        error.code = 500;
        return next(error);
    }

    res.status(201).json({emotion: createdEmotion});
} 

const updateEmotionById = async (req, res, next) => {
    const {emotion, reason, description} = req.body;
    const eId = req.params.eid;

    try {
        emo = await Emotion.findById(eId);
    } catch (er) {
        const error = new Error(er.massage);
        error.code = 500;
        return next(error);
    } 

    emo.emotion = emotion;
    emo.reason = reason;
    emo.description = description;

    try {
        emo.save();
    } catch (er) {
        const error = new Error(er.massage);
        error.code = 500;
        return next(error);
    }

    res.status(200).json({emotion: emo.toObject({getters: true}) });
};

const deleteEmotionById = async (req, res,next) => {
    const eId = req.params.eid;

    try {
        await Emotion.findByIdAndRemove(eId);
    } catch (er) {
        const error = new Error('can`t be removed');
        error.code = 500;
        return next(error);
    }

    res.status(200).json({massage: 'deleted secceed'});
};

exports.getEmotionsByUserId = getEmotionsByUserId;
exports.getEmotionsByUserIdAndDate = getEmotionsByUserIdAndDate;
exports.createEmotion = createEmotion;
exports.getEmotionById = getEmotionById;
exports.updateEmotionById = updateEmotionById;
exports.deleteEmotionById = deleteEmotionById;
exports.getStatisticsTheMostCommonEmotion =getStatisticsTheMostCommonEmotion;
exports.getStatisticsTheMostCommonReason =getStatisticsTheMostCommonReason;
exports.getStatisticsTheCauseOfNegativeEmotions = getStatisticsTheCauseOfNegativeEmotions;
exports.getStatisticsTheCauseOfPositiveEmotions = getStatisticsTheCauseOfPositiveEmotions;
