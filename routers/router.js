let express = require('express');
let empmodel = require('../model/model')
let emprouter = express();
let patient = require("../model/patient.js");
let Doctor = require("../model/Doctors.js");
const Clinic = require('../model/Clinicadd');
const multer = require('multer');
const path = require('path');


// Define storage for the uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'upload/'); // Upload files to the 'uploads' directory
  },
  filename: (req, file, cb) => {
    // Define a unique filename for each uploaded file
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Create an instance of multer middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // Limit file size to 5MB
  },
  fileFilter: (req, file, cb) => {
    // Allow only certain file types
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Images only (JPEG, JPG, PNG)');
    }
  }
});



// page eken back unama redirect wena thana 
emprouter.get('/', async (req, res) => {
  try {
    const patientId = req.session.userId;
    const role = await patient.findById(patientId);
    const result = patientId

    if (role && role.role === 'doctor') {
      empmodel.find({})
        .then((x) => {
          res.render('/', { x });
        });

    }else if (role && role.role === 'admin') {

      const count = await empmodel.countDocuments();

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
      
  // Render your view or send the retrieved data to the client
    res.render('adminPanel', { result,empData , roleCounts , count});


    } else {
      
      // empmodel.find({})
      //   .then((x) => {
      //     res.render('home', { x });
      //   })
      //   .catch((y) => {
      //     console.log(y);
      //     res.status(500).send('Error fetching data');
      //   });

        // Fetch clinic data
        const clinics = await Clinic.find({ cstatus: 'accepted' });
        
        // Render home page with clinic data
        res.render('home', { clinics });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});



//logout
emprouter.get('/logout', async (req, res) => {
  try {
    // Retrieve patient ID from the session
    const patientId = req.session.userId;

    if (!patientId) {
      // Handle case if patient is not logged in
      req.flash('error', 'Please log in as a patient');
      return res.redirect('/');
    }

    // Clear the session data (including userId)
    req.session.destroy(async (err) => {
      if (err) {
        req.flash('error', 'Error logging out');
        return res.redirect('/');
      }

      // Fetch clinics from the database
      try {
        const clinics = await Clinic.find({ cstatus: 'accepted' });
        
        res.clearCookie('session-id'); // Clearing any associated cookies (optional)
        res.locals.loggedOut = true;

        // Render the home page with clinics data after successful logout
        res.render('home', { clinics });
      } catch (fetchError) {
        console.error('Error fetching clinics:', fetchError);
        req.flash('error', 'Error loading clinics');
        return res.redirect('/');
      }
    });
  } catch (error) {
    console.error('Error during logout:', error);
    req.flash('error', 'Error logging out');
    res.redirect('/'); // Redirect to the desired route or handle the error accordingly
  }
});



emprouter.get('/doctor11', (req, res) => {
  res.render('doctor11'); // 


// emprouter.post('/doctor11', async (req, res) => {
//     try {
//         const { name, specialization, about, slmcNumber, image } = req.body;

//         const newDoctor = new Doctor({
//             name,
//             specialization,
//             about,
//             slmcNumber,
//             image
//         });

//         await newDoctor.save();
//         res.status(201).json(newDoctor);
//     } catch (error) {
//         console.error('Error adding doctor:', error);
//         res.status(500).json({ error: 'Failed to add doctor' });
//     }
// });
});




// emprouter.post('/BecomeDoctor', async (req, res) => {
//   try {
//     const patientId = req.session.userId; 
  

//     if (!patientId) {
//       // Handle case if patient is not logged in
//       req.flash('error', 'Please log in as a patient');
//       res.redirect('/login');
//       return;
//     }
//     const data = {
//       name: req.body.name,
//       specialization: req.body.specialization,
//       about: req.body.about,
//       clinic: req.body.clinic,
//       slmcNumber: req.body.slmcNumber,
//       image: req.body.image,
//       docID: patientId
//     };

//     console.log("Received doctor data:", data);

//     await Doctor.create(data);
//     req.flash('success', 'Data has been created in the Database');
//     console.log("Added doctor details");
//     res.redirect('/');
//   } catch (error) {
//     req.flash('error', 'Data has not been created in the Database');
//     console.error("Error adding doctor details:", error);
//     res.redirect('/');
//   }
// });



// emprouter.post('/BecomeDoctor', upload.single('image'), async (req, res) => {
//   try {
//     const patientId = req.session.userId; 

//     if (!patientId) {
//       req.flash('error', 'Please log in as a patient');
//       return res.redirect('/login');
//     }

//     const data = {
//       name: req.body.name,
//       specialization: req.body.specialization,
//       about: req.body.about,
//       clinic: req.body.clinic,
//       slmcNumber: req.body.slmcNumber,
//       image: req.file ? `/upload/${req.file.filename}` : null,
//       email: req.body.email,// Save file path if uploaded
//       docID: patientId,
//       startTime: req.body.startTime || '09:00',  // Default to '09:00' if not provided
//       endTime: req.body.endTime || '17:00'       // Default to '17:00' if not provided
//     };

//     console.log("Received doctor data:", data);

//     await Doctor.create(data);
//     req.flash('success', 'Doctor profile has been successfully created');
//     return res.redirect('/BecomeDoctor');  // Redirect to the same page to show SweetAlert message
//   } catch (error) {
//     req.flash('error', 'Failed to create Doctor profile');
//     console.error("Error adding doctor details:", error);
//     return res.redirect('/BecomeDoctor');  // Redirect to the same page to show SweetAlert message
//   }
// });


emprouter.post('/BecomeDoctor', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'proof', maxCount: 1 }]), async (req, res) => {
  try {
    const patientId = req.session.userId; 

    if (!patientId) {
      req.flash('error', 'Please log in as a patient');
      return res.redirect('/login');
    }

    const data = {
      name: req.body.name,
      specialization: req.body.specialization,
      about: req.body.about,
      clinic: req.body.clinic,
      slmcNumber: req.body.slmcNumber,
      image: req.files['image'] ? `/upload/${req.files['image'][0].filename}` : null,  // Process image file
      proof: req.files['proof'] ? `/upload/${req.files['proof'][0].filename}` : null,  // Process proof file
      email: req.body.email,
      docID: patientId,
      startTime: req.body.startTime || '09:00',
      endTime: req.body.endTime || '17:00'
    };

    console.log("Received doctor data:", data);

    await Doctor.create(data);
    req.flash('success', 'Doctor profile has been successfully created');
    return res.redirect('/BecomeDoctor');
  } catch (error) {
    req.flash('error', 'Failed to create Doctor profile');
    console.error("Error adding doctor details:", error);
    return res.redirect('/BecomeDoctor');
  }
});


emprouter.get('/addclinic', (req, res) => {

  const patientId = req.session.userId;
    

    if (!patientId) {
      req.flash('error', 'Please log in as a patient');
      return res.redirect('/login');
    }
   res.render('addclinic'); // 

});



// emprouter.post('/addclinic', async (req, res) => {
//   try {
//     const { clinicName, location, licenceNumber, description, services, doctorDetails } = req.body;

//     const clinic = new Clinic({
//       clinicName,
//       location,
//       licenceNumber,
//       description,
//       services,
//       doctors: doctorDetails
//     });

//     await clinic.save();
//     res.status(201).send("Clinic registered successfully");
//   } catch (error) {
//     console.error("Error registering clinic:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// emprouter.post('/addclinic', async (req, res) => {
//   try {
//     const { clinicName, location, licenceNumber, description, services, doctorDetails } = req.body;

//     if (!clinicName || !location || !licenceNumber || !doctorDetails) {
//       return res.status(400).send("Missing required clinic fields");
//     }

//     const doctorIds = [];

//     // Loop through each doctor in the details
//     for (const doctor of doctorDetails) {
//       const { name, clinic, specialization, about, slmcNumber, image } = doctor;

//       if (!name || !specialization || !slmcNumber) {
//         return res.status(400).send("Missing required doctor fields");
//       }

//       const newDoctor = new Doctor({
//         name,
//         clinic,
//         specialization,
//         about,
//         slmcNumber,
//         image
//       });

//       const savedDoctor = await newDoctor.save();
//       doctorIds.push(savedDoctor._id);
//     }

//     // Create the clinic with references to the doctors
//     const clinic = new Clinic({
//       clinicName,
//       location,
//       licenceNumber,
//       description,
//       services,
//       doctors: doctorIds
//     });

//     await clinic.save();
//     res.status(201).send("Clinic and doctors registered successfully");
//   } catch (error) {
//     console.error("Error registering clinic and doctors:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });



// emprouter.post('/addclinic', async (req, res) => {
//   try {
    
//     const { clinicName, location, licenceNumber, description, services, doctorDetails, startTime, endTime,image,about } = req.body;


//     // Validate clinic fields
//     if (!clinicName || !location || !licenceNumber || !description || !services || !Array.isArray(doctorDetails)) {
//       return res.status(400).send("Missing required clinic fields or doctor details");
//     }

//     const doctorIds = [];
//     const validClinics = ['A', 'B', 'C']; // Replace with your actual enum values

//     for (const doctor of doctorDetails) {
//       const { name, clinic, specialization, about, slmcNumber, image, email } = doctor;

//       // Validate doctor fields
//       if (!name || !specialization || !slmcNumber || !clinic || !validClinics.includes(clinic) || !email || !startTime || !endTime || !image || !about ) {
//         console.error("Invalid or missing doctor fields in doctor object:", doctor);
//         return res.status(400).send("Invalid or missing doctor fields");
//       }

//       // Create corresponding user in Register schema with default password
//       const defaultPassword = '123456';

//       const newUser = new patient({
//         name,
//         email,
//         password: defaultPassword,
//         cpassword: defaultPassword, // Ensure cpassword is also set
//         role: 'doctor'
//       });

//       const savedUser = await newUser.save();

//       // Create new Doctor
//       const newDoctor = new Doctor({
//         name,
//         clinic,
//         specialization,
//         about,
//         slmcNumber,
//         image,
//         email,
//         docID: savedUser._id,// Assign the Register ID to docID
//         startTime: req.body.startTime || '09:00',  // Default to '09:00' if not provided
//         endTime: req.body.endTime || '17:00'       // Default to '17:00' if not provided
//       });

//       const savedDoctor = await newDoctor.save();
//       doctorIds.push(savedDoctor._id);
//     }

//     // Create the clinic with references to the doctors
//     const clinic = new Clinic({
//       clinicName,
//       location,
//       licenceNumber,
//       description,
//       services,
//       image,
//       doctors: doctorIds,
//       about,
//       cstatus

//     });

//     await clinic.save();
//     res.status(201).send("Clinic and doctors registered successfully");
//   } catch (error) {
//     console.error("Error registering clinic and doctors:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// emprouter.post('/addclinic', async (req, res) => {
//   try {
//     const { clinicName, location, licenceNumber, description, services, doctorDetails, image, about } = req.body;

//     // Validate clinic fields
//     if (!clinicName || !location || !licenceNumber || !description || !services || !Array.isArray(doctorDetails)) {
//       return res.status(400).send("Missing required clinic fields or doctor details");
//     }

//     const doctorIds = [];
//     const validClinics = ['A', 'B', 'C']; // Replace with your actual enum values

//     for (const doctor of doctorDetails) {
//       const { name, clinic, specialization, about, slmcNumber, image, email, startTime, endTime } = doctor;

//       // Validate doctor fields
//       if (!name || !specialization || !slmcNumber || !clinic || !validClinics.includes(clinic) || !email || !startTime || !endTime || !image || !about) {
//         console.error("Invalid or missing doctor fields in doctor object:", doctor);
//         return res.status(400).send("Invalid or missing doctor fields");
//       }

//       // Create corresponding user in Register schema with default password
//       const defaultPassword = '123456';

//       const newUser = new patient({
//         name,
//         email,
//         password: defaultPassword,
//         cpassword: defaultPassword, // Ensure cpassword is also set
//         role: 'doctor'
//       });

//       const savedUser = await newUser.save();

//       // Create new Doctor
//       const newDoctor = new Doctor({
//         name,
//         clinic:clinicName,
//         specialization,
//         about,
//         slmcNumber,
//         image,
//         email,
//         docID: savedUser._id, // Assign the patient ID to docID
//         startTime,
//         endTime
//       });

//       const savedDoctor = await newDoctor.save();
//       doctorIds.push(savedDoctor._id);
//     }

//     // Create the clinic with references to the doctors
//     const clinic = new Clinic({
//       clinicName,
//       location,
//       licenceNumber,
//       description,
//       services,
//       image, // Updated to use clinicImage from request
//       about, // Updated to use clinicAbout from request
//       doctors: doctorIds
//     });

//     await clinic.save();
//     res.status(201).send("Clinic and doctors registered successfully");
//   } catch (error) {
//     console.error("Error registering clinic and doctors:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });



// emprouter.post('/addclinic', upload.single('image'), async (req, res) => {
//   try {
//     const { clinicName, location, licenceNumber, description, services, doctorDetails,about } = req.body;
//     const image = req.file ? `/upload/${req.file.filename}` : null;

//     // Validate clinic fields
//     if (!clinicName || !location || !licenceNumber || !description || !services || !Array.isArray(doctorDetails)) {
//       return res.status(400).send("Missing required clinic fields or doctor details");
//     }

//     const doctorIds = [];

//     for (const doctor of doctorDetails) {
//       const { name, specialization, about, slmcNumber, image, email, startTime, endTime } = doctor;

//       // Validate doctor fields
//       if (!name || !specialization || !slmcNumber || !email || !startTime || !endTime || !image || !about) {
//         console.error("Invalid or missing doctor fields in doctor object:", doctor);
//         return res.status(400).send("Invalid or missing doctor fields");
//       }

//       // Create corresponding user in Register schema with default password
//       const defaultPassword = '123456';

//       const newUser = new patient({
//         name,
//         email,
//         password: defaultPassword,
//         cpassword: defaultPassword, // Ensure cpassword is also set
//         role: 'doctor'
//       });

//       const savedUser = await newUser.save();

//       // Create new Doctor and automatically assign the clinicName
//       const newDoctor = new Doctor({
//         name,
//         clinic: clinicName, // Automatically assign the clinic name to the doctor
//         specialization,
//         about,
//         slmcNumber,
//         image,
//         email,
//         docID: savedUser._id, // Assign the patient ID to docID
//         startTime,
//         endTime
//       });

//       const savedDoctor = await newDoctor.save();
//       doctorIds.push(savedDoctor._id);
//     }

//     // Create the clinic with references to the doctors
//     const clinic = new Clinic({
//       clinicName,
//       location,
//       licenceNumber,
//       description,
//       services,
//       image,
//       about,
//       doctors: doctorIds
//     });

//     await clinic.save();
//     res.status(201).send("Clinic and doctors registered successfully");
//   } catch (error) {
//     console.error("Error registering clinic and doctors:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });


emprouter.post('/addclinic', upload.fields([
  { name: 'image', maxCount: 1 }, 
  // Add a field for each potential doctor image upload
  ...Array.from({ length: 10 }, (_, i) => ({ name: `doctorDetails[${i}][image]`, maxCount: 1 })) 
]), async (req, res) => {
  try {
    const { clinicName, location, licenceNumber, description, services, doctorDetails, about } = req.body;
    const clinicImage = req.files['image'] ? `/upload/${req.files['image'][0].filename}` : null;

    // Validate clinic fields
    if (!clinicName || !location || !licenceNumber || !description || !services || !Array.isArray(doctorDetails)) {
      return res.status(400).send("Missing required clinic fields or doctor details");
    }

    const doctorIds = [];

    for (let i = 0; i < doctorDetails.length; i++) {
      const doctor = doctorDetails[i];
      const { name, specialization, about, slmcNumber, email, startTime, endTime } = doctor;
      const doctorImageField = `doctorDetails[${i}][image]`;
      const doctorImage = req.files[doctorImageField] ? `/upload/${req.files[doctorImageField][0].filename}` : null;

      // Validate doctor fields
      if (!name || !specialization || !slmcNumber || !email || !startTime || !endTime || !doctorImage || !about) {
        console.error("Invalid or missing doctor fields in doctor object:", doctor);
        return res.status(400).send("Invalid or missing doctor fields");
      }

      // Create corresponding user in Register schema with default password
      const defaultPassword = '123456';

      const newUser = new patient({
        name,
        email,
        password: defaultPassword,
        cpassword: defaultPassword, // Ensure cpassword is also set
        role: 'doctor'
      });

      const savedUser = await newUser.save();

      // Create new Doctor and automatically assign the clinicName
      const newDoctor = new Doctor({
        name,
        clinic: clinicName, // Automatically assign the clinic name to the doctor
        specialization,
        about,
        slmcNumber,
        image: doctorImage,
        email,
        docID: savedUser._id, // Assign the patient ID to docID
        startTime,
        endTime
      });

      const savedDoctor = await newDoctor.save();
      doctorIds.push(savedDoctor._id);
    }

    // Create the clinic with references to the doctors
    const clinic = new Clinic({
      clinicName,
      location,
      licenceNumber,
      description,
      services,
      image: clinicImage,
      about,
      doctors: doctorIds
    });

    await clinic.save();
    res.status(201).send("Clinic and doctors registered successfully");
  } catch (error) {
    console.error("Error registering clinic and doctors:", error);
    res.status(500).send("Internal Server Error");
  }
});





// emprouter.get('/clinic', async (req, res) => {
//   try {
//     const clinic = await Clinic.find().exec();
//     res.render('clinic', { clinic }); // Render a template with all clinics
//   } catch (error) {
//     console.error('Error fetching clinics:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

// emprouter.get('/clinic', async (req, res) => {
//   try {
//     const clinics = await Clinic.find();
//     if (clinics.length === 0) {
//       return res.status(404).send('No clinics found');
//     }
//     res.render('clinic', { clinics }); // Pass the clinics data to the template
//   } catch (error) {
//     console.error('Error fetching clinics:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });


emprouter.get('/clinic', async (req, res) => {
  try {
    // Fetch clinics with a status of 'pending'
    const clinics = await Clinic.find({ cstatus: 'pending' });
    
    // Render the clinics list page
    res.render('clinic', { clinics });
  } catch (error) {
    console.error('Error fetching clinics:', error);
    res.status(500).send('Internal server error');
  }
});

  
module.exports = emprouter;