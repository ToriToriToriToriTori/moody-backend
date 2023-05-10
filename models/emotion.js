  const mongoose = require("mongoose");

  const Schema = mongoose.Schema;

  const emotionSchema = new Schema({
    uid: {type: mongoose.Types.ObjectId, required: true, ref: 'User'},
    emotion: {type: String, required: true},
    reason: {type: String, required: true},
    description: {type: String, required: true},
    date: {type: Date, required: true}
  });

module.exports = mongoose.model('Emotion', emotionSchema);