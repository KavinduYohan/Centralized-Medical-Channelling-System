let mongoose = require('mongoose');

let becomedoc = new mongoose.Schema({
    dname : String,
    slmc : String,
    email : String,
    specialization : String,
    
    description:String,
    ex : String,

    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'patientRegister' } // Change userId to patientId

    
});

let docd = mongoose.model('docd', becomedoc);

module.exports = docd;