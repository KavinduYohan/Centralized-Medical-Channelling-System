const router = require("express").Router();
let patient = require("../model/patient.js");
let empmodel = require('../model/model')
let Doctors = require('../model/Doctors.js');
let Clinic = require('../model/Clinicadd.js');

let Reservation = require("../model/reservation.js");

router.get('/addfiles', async(req, res) => {
  const tests = await AdminTest.find()


  res.render('addfiles',{tests})
})



//register
router.get('/register', (req, res) => {
  res.render('register', { error: req.flash('error') }); // Pass the 'error' to the view
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, cpassword } = req.body;
    const newPatient = new patient({
      name,
      email,
      password,
      cpassword,
      
      
    });

    if (password.length < 6) {

      
      req.flash('error', 'Password should be at least 6 character');
      res.render('register', { error: req.flash('error') }); // Render register with error

    }else {
      if (password === cpassword) {
        const userExist = await patient.findOne({ email: email });
  
        if (userExist) {
          req.flash('error', 'Email already exists');
          res.render('register', { error: req.flash('error') }); // Render register with error
        }  else {
          await newPatient.save();
          req.flash('error', 'Registered successfully');
          res.redirect('/login'); // Redirect to a different page or the same page
      }
  
      } else {
        req.flash('error', 'Passwords do not match');
        res.render('register', { error: req.flash('error') }); // Render register with error
      }
    } 
    }

    catch (err) {
      req.flash('error', 'Internal server error');
      res.render('register', { error: req.flash('error') }); // Render register with error
    }
  });



// Login route
router.get('/login', (req, res) => {
  res.render('login', { error: req.flash('error') });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password ,role } = req.body;
    const result = await patient.findOne({ email: email });
    

    // const count = await empmodel.countDocuments();
   

    if (result && result.password === password) {
      req.session.userId = result._id; // Store user ID in session upon successful login
    
      if (result.role === 'doctor') {
        console.log('Logged-in Doctor ID:', result._id);
    
        // Get today's date in UTC
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0); // Start of today in UTC
        const startOfToday = new Date(today.toISOString().split('T')[0]); // Format to ISO date string
        const endOfToday = new Date(startOfToday);
        endOfToday.setUTCDate(startOfToday.getUTCDate() + 1); // Start of the next day in UTC
    
        // Convert to ISO strings for comparison
        const startOfTodayISO = startOfToday.toISOString();
        const endOfTodayISO = endOfToday.toISOString();
    
        try {
          // Query the database for today's appointments for the logged-in doctor
          const todayAppointmentsCount = await Reservation.countDocuments({
            doctorId: result._id,
            date: { $gte: startOfTodayISO, $lt: endOfTodayISO }, // Appointments today
            status: { $ne: 'rejected' } // Ignore rejected appointments
          });
    
          // Query the database for upcoming appointments (excluding today's appointments)
          const upcomingAppointmentsCount = await Reservation.countDocuments({
            doctorId: result._id,
            date: { $gte: endOfTodayISO }, // Appointments after today
            status: { $ne: 'rejected' } // Ignore rejected appointments
          });
    
          // Pass the counts and user ID to the doctor.ejs template
          res.render('doctor', {
            userId: result._id,
            todayAppointmentsCount,
            upcomingAppointmentsCount
          });
    
        } catch (error) {
          console.error('Error fetching appointments:', error);
          res.status(500).send('Error fetching appointments');
        }
       
      }if(result.role == 'admin'){
        const empData = await patient.find({});
        const roleCounts = empData.reduce((acc, curr) => {
          if (curr.role === 'patient') {
            acc.patient++;
          } else if (curr.role === 'doctor') {
            acc.doctor++;
          } else if (curr.role === 'admin') {
            acc.admin++;
          }
          return acc;
        }, { patient: 0, doctor: 0, admin: 0 });
        
        
        const monthCounts = await patient.aggregate([
          {
              $group: {
                  _id: "$month",
                  count: { $sum: 1 }
              }
          }
      ]);
      
      const countsByMonth = {};
      monthCounts.forEach(({ _id, count }) => {
          countsByMonth[_id] = count;
      });
      

    // Render your view or send the retrieved data to the client
      res.render('adminPanel', { result , empData, roleCounts ,countsByMonth});
        //res.render('adminPanel', { userId: result._id }); // Pass the user ID to the home page
      }else {
        const clinics = await Clinic.find({ cstatus: 'accepted' });
        //console.log(clinics)

        res.render('home', { userId: result._id, clinics: clinics });
      }
    } else {
      req.flash('error', 'Invalid credentials');
      res.render('login', { error: req.flash('error') }); // Render login with error
    }
  } catch (err) {
    req.flash('error', 'Internal server error');
    res.render('login', { error: req.flash('error') }); // Render login with error
  }
});

// PMS route
router.get('/pms/:id', async (req, res) => {
  try {
    const userId = req.session.userId; // Retrieve user ID from the session

    if (!userId) {
      // Handle case if user is not logged in
      req.flash('error', 'Please log in');
      res.redirect('/login');
      return;
    }

    const patients = await patient.find({});
    res.render('index', { x: patients, userId }); // Pass both patients and userId to the view
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});




// fetch or get 
router.route("/").get((req, res) => {
  patient.find().then((patient) => {
    res.json(patient)
  }).catch((err) => {
    console.log(err);
  })
})

//update individual record

router.route("/edit/:id").put(async (req, res) => {

  let userId = req.params.id;
  //const name = req.body.name; mehemt puluwm req eken ena data store krgnna or else 
  const { name, email, password } = req.body; // destructuring method

  const updatePatient = {  // kalin wge object hdlth puluwnn
    name,
    email,
    password

  }
  //userID as 1st parameter and updatePatient as 2nd paramter
  const update = await patient.findByIdAndUpdate(userId, updatePatient) //updatePatient hdnn nathuwwa kelinm dnnth puluwnn //findone ekei wge hoynw nn email eken wge hoynw nn //
    .then(() => {
      res.status(200).send({ status: "user updated" })  // succuss nn 200 dnne
    }).catch((err) => {
      console.log(err);
      res.status(500).send({ status: "error with updating data", error: err.massage }); // UI ekat send krnw  // 500 kiynne server error 
    })

  //delete patient

  router.route("/delete/:id").delete(async (req, res) => {
    let userId = req.params.id;
  
    try {
      // Step 1: Delete the patient
      const patient = await patient.findByIdAndDelete(userId);
      if (!patient) {
        return res.status(404).send({ status: "Patient not found" });
      }
  
      // Step 2: Delete the corresponding doctor entry if it exists
      await Doctors.findOneAndDelete({ docID: mongoose.Types.ObjectId(userId) });
  
      res.status(200).send({ status: "User and corresponding doctor entry deleted" });
    } catch (err) {
      console.log(err.message);
      res.status(500).send({ status: "Error with delete patient", error: err.message });
    }
  });

})


router.get('///', (req, res)=>{
  patient.find({})
  .then((x)=>{
      res.render('adminpanel', {x})
  })
  .catch((y)=>{
      console.log(y)
  })
  
})

router.get('///', (req, res)=>{
  patient.find({})
  .then((x)=>{
      res.render('doctor', {x})
  })
  .catch((y)=>{
      console.log(y)
  })
  
})

module.exports = router;