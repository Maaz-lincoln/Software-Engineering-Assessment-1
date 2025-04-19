const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required : [true, "Email is required"],
  },
  otp:{
    type: String,
  }
}, {
  timestamps: true,
});

const Otp = mongoose.model('Otp', OtpSchema);

module.exports = Otp;
