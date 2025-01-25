let mongoose = require('mongoose');

let myschema = mongoose.Schema({
    pname : String,
    doctor_name : String,
    appointment_date : Date,
    description : String,
    testname: String,
    prescriptionPhoto: String,
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'patientRegister' } // Change userId to patientId
});

let mymodel = mongoose.model('table', myschema);

module.exports = mymodel;
