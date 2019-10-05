const mongoose = require('mongoose');

const userScheme = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  firstName: {
    type: String,
    required: true
  },
  lastName: String,
  created: {
    type: Date,
    default: Date.now
  },
  phoneNumber: String,
  userAddres: String,
  email: {
    type: String,

    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'User',
    required: true
  },
  token: {
    type: String,
    require: true
  }
});

const User = mongoose.model('User', userScheme);
module.exports = User;
