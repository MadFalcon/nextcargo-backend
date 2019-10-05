const mongoose = require('mongoose');

const newsScheme = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: String,
  description: String,
  created: {
    type: Date,
    default: Date.now
  },
  photo: String,

});

const News = mongoose.model('News', newsScheme);
module.exports = News;
