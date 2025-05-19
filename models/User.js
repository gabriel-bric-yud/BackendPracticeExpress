const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,  
    index: true       
  },
  hashedPassword: {
    type: String,
    required: true
  },
  bio: {
    type: String
  }
  // other fields...
});

module.exports = mongoose.model('User', userSchema);