let mongoose = require('mongoose');

let adminsch = mongoose.Schema({
    testname : String,
   
    
});

let AdminTest = mongoose.model('AdminTest', adminsch);

module.exports = AdminTest;
