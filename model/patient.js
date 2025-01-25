const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Doctors = require('./Doctors');

const patientSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  cpassword: {
    type: String,
    required: true
  },
   role: {
        type: String,
        enum: ['patient', 'doctor','admin'],
        default: 'patient', 
  },
  month: {
    type: String,
    default: () => {
        const date = new Date();
        const month = date.toLocaleString('default', { month: 'long' });
        return month;
    }
}
    
})

const Patient = mongoose.model("patientRegister", patientSchema);
module.exports = Patient;