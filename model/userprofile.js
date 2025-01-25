let mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for user profile
const userProfileSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,

  },
  dob: {
    type: Date
  },
  age: {
    type: Number,
    virtual: true,
    get: function() {
      if (!this.dob) return null;
      const diff = Date.now() - this.dob.getTime();
      const ageDate = new Date(diff);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    }
  },
  nic: {
    type: String
  },
  civilStatus: {
    type: String
  },
  gender: {
    type: String
  },
  religion: {
    type: String
  },
  occupation: {
    type: String
  },
  address: {
    type: String
  },
  mobileNo: {
    type: String
  },
  birthPlace: {
    type: String
  },
  bloodGroup: {
    type: String
  },
  profilePic: {
    type: String // You can store the path or URL to the profile picture
  },

  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'patientRegister' } // Change userId to patientId
});




const userprofile = mongoose.model('UserProfile', userProfileSchema);

module.exports = userprofile;
