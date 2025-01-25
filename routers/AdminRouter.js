const Adrouter = require("express").Router();
let AdminTest = require("../model/AdminTest");

let patient = require("../model/patient.js");
let docd = require("../model/docd");

Adrouter.get('/addTest', (req, res) => { 

  res.render('addTest'); 
});


Adrouter.post('/addTest', async (req, res) => {
  try {
    const patientId = req.session.userId; 


    if (!patientId) {
      // Handle case if patient is not logged in
      req.flash('error', 'Please log in as a patient');
      res.redirect('/login');
      return;
    }
   
    const data = {
      testname: req.body.pname,
      
    };
   
    await AdminTest.create(data);
    req.flash('success', 'Data has been created in the Database');
    res.redirect('/');
  } catch (error) {
    req.flash('error', 'Data has not been created in the Database');
    res.redirect('/');
  }
});



Adrouter.get('/Accept/:id', async (req, res) => {
  try {
   
    const readquery = req.params.id;
    const doctor = await docd.findById(readquery)
    const emailtest = doctor.email;
    const result = await patient.findOne({ email: emailtest });
    
    if (result.email == emailtest) {

      const updatedEntry = await patient.findOneAndUpdate(
        { _id: result}, // Query condition
        {
          $set: {
            role:'doctor',
          }
        },
        { new: true } 
      );

      const deletedUser = await docd.findByIdAndDelete(readquery);
      
      res.redirect('/');
     
    } else {
      const deletedUser = await docd.findByIdAndDelete(readquery);
      res.status(404).send('user not found');
      
    }
  } catch (error) {
    
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
  
Adrouter.delete("/deleteRequest/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await docd.findByIdAndDelete(userId);

      if (deletedUser) {   
        res.redirect('/');

      } else {
        res.status(404).send({ status: "User not found" });
      }


  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "Error deleting user", error: error.message });
  }
});



Adrouter.get('/addtesttable', async (req, res) => {
  try {
    const patientId = req.session.userId; // Retrieve patient ID from the session

    if (!patientId) {
      // Handle case if patient is not logged in
      req.flash('error', 'Please log in as a patient');
      res.redirect('/login');
      return;
    }

    // Find empmodel data related to the patientId
    const empData = await AdminTest.find().populate();

    
    // Render your view or send the retrieved data to the client
    res.render('addTestTable', { empData });
  } catch (error) {
    req.flash('error', 'Error fetching data');
    res.redirect('/'); // Redirect to the desired route or handle the error accordingly
  }
});
  
Adrouter.delete("/deletetest/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await AdminTest.findByIdAndDelete(userId);

      if (deletedUser) {   
        res.redirect('/');

      } else {
        res.status(404).send({ status: "User not found" });
      }


  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "Error deleting user", error: error.message });
  }
});


module.exports = Adrouter;