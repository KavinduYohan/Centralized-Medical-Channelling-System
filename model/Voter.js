const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Voter schema
const voterSchema = new Schema({
  fullName: {
    type: String,
    required: true
  },
  nameWithInitial: {
    type: String,
    required: true
  },
  nic: {
    type: String,
    required: true,
    unique: true  // Assuming NIC should be unique
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other'] // Define allowed values for gender
  },
  address: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  zonal: {
    type: String,
    required: true
  }
});

// Create a model from the schema
const Voter = mongoose.model('Voter', voterSchema);

module.exports = Voter;
