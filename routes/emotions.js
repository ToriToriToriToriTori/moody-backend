const bodyParser = require('body-parser');
const express = require('express');
const {check} = require('express-validator');

const emotionsControllers = require('../controllers/emotionControler');

const router = express.Router();
//const checkAuth = require('../middleware/check-auth');
//router.use(checkAuth);

router.get('/:uid/statistics/theMostCommonEmotion', emotionsControllers.getStatisticsTheMostCommonEmotion);
router.get('/:uid/statistics/theMostCommonReason', emotionsControllers.getStatisticsTheMostCommonReason);
router.get('/:uid/statistics/theCauseOfNegativeEmotions', emotionsControllers.getStatisticsTheCauseOfNegativeEmotions);
router.get('/:uid/statistics/theCauseOfPositiveEmotions', emotionsControllers.getStatisticsTheCauseOfPositiveEmotions);

router.get('/:uid', emotionsControllers.getEmotionsByUserId);
router.get('/:uid/:eid', emotionsControllers.getEmotionById);
router.get('/:uid/date/:date', emotionsControllers.getEmotionsByUserIdAndDate);

router.post('/', emotionsControllers.createEmotion);

router.patch('/:uid/:eid', emotionsControllers.updateEmotionById);

router.delete('/:uid/:eid', emotionsControllers.deleteEmotionById);


module.exports = router;