const express = require('express');
const Vrouter = express.Router();
const Voter = require('../model/Voter');
const  Reservation = require('../model/reservation'); // Assuming Voter model is defined in models/Voter.js
//let Doctor = require("../model/Doctors.js");
const Doctor = require('../model/Doctors');
const Patient = require("../model/patient");
const reservation = require("../model/reservation");
const Clinic = require("../model/Clinicadd");

//const Doctors = require('../model/Doctors');
//const Doctors = require('../model/Doctors');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const { log } = require('console');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kavindumarasinghe70@gmail.com',
    pass: 'qgox jyjd ncma yolx',
  },
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'upload/'); // Make sure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append the file extension
  }
});

const upload = multer({ storage: storage });

// Route: GET /voters
// Description: Get all voters
Vrouter.get('/AddVoter', async (req, res) => {
  try {
    const patientId = req.session.userId;
    

    if (!patientId) {
      req.flash('error', 'Please log in as a patient');
      return res.redirect('/login');
    }

    // Render the 'AddVoter' view if the user is logged in as a patient
    res.render('AddVoter');
  } catch (err) {
    // Handle any errors that occur during rendering
    res.status(500).json({ message: err.message });
  }
});


// Route: POST /voters
// Description: Create a new voter
Vrouter.post('/AddVoter', async (req, res) => {
  const voter = new Voter({
    fullName: req.body.fullName,
    nameWithInitial: req.body.nameWithInitial,
    nic: req.body.nic,
    address: req.body.address,
    district: req.body.district,
    gender: req.body.gender,
    zonal: req.body.zonal
  });

  try {
    const newVoter = await voter.save();
    res.status(201).json(newVoter);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Route: DELETE /voters/:id
// Description: Delete a specific voter by ID
Vrouter.delete('/AddVoter/:id', async (req, res) => {
  try {
    const deletedVoter = await Voter.findByIdAndRemove(req.params.id);
    if (!deletedVoter) {
      return res.status(404).json({ message: 'Voter not found' });
    }
    res.json({ message: 'Voter deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



Vrouter.get('/showVoter', async (req, res) => {
  try {
    const voters = await Voter.find(); // Retrieve all voters from the database
    res.render('showVoter', { voters }); // Render the EJS template with the fetched data
  } catch (error) {
    console.error('Error fetching voters:', error);
    res.status(500).send('Internal Server Error');
  }
});



Vrouter.post('/status/:reservationId/accept', async (req, res) => {
  const { reservationId } = req.params;

  try {
    const reservation = await Reservation.findByIdAndUpdate(
      reservationId,
      { status: 'accepted' },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found.' });
    }

    const doctor = await Doctor.findOne({ docID: reservation.doctorId });
    const patient = await Patient.findById(reservation.patientId);

    if (!doctor || !patient) {
      return res.status(500).json({ message: 'Doctor or Patient not found.' });
    }

    const mailOptions = {
      from: 'kavindumarasinghe70@gmail.com',
      to: patient.email,
      subject: 'Reservation Accepted',
      text: `Dear ${patient.name},\n\nYour reservation scheduled for ${reservation.date.toDateString()} at ${reservation.timeSlot} has been accepted.\n\nBest regards,\nDr. ${doctor.name}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        req.flash('error', 'Reservation rejected, but there was an error sending the email.');
      } else {
        req.flash('success', 'Reservation rejected and email sent successfully!');
      }
      return res.redirect('/status'); // Redirect to the same page with success or error message
    });
  } catch (error) {
    console.error('Error:', error);
    req.flash('error', 'Server error.');
    return res.redirect('/status'); // Redirect with error message
  }
});



// Vrouter.post('/status/:reservationId/accept', async (req, res) => {
//   const { reservationId } = req.params;

//   try {
//     const reservation = await Reservation.findByIdAndUpdate(
//       reservationId,
//       { status: 'accepted' },
//       { new: true }
//     );

//     if (!reservation) {
//       return res.status(404).json({ message: 'Reservation not found.' });
//     }

//     res.status(200).json(reservation);
//   } catch (err) {
//     console.error('Error accepting reservation:', err);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

// Vrouter.post('/status/:reservationId/accept', async (req, res) => {
//   const { reservationId } = req.params;

//   try {
//     // Update the reservation status to 'accepted'
//     const reservation = await Reservation.findByIdAndUpdate(
//       reservationId,
//       { status: 'accepted' },
//       { new: true }
//     );

//     if (!reservation) {
//       return res.status(404).json({ message: 'Reservation not found.' });
//     }

//     // Fetch doctor and patient details
//     const doctor = await Doctor.findOne({ docID: reservation.doctorId });
//     const patient = await Patient.findById(reservation.patientId);
//     console.log(doctor)
//     console.log(patient)



//     if (!doctor || !patient) {
//       return res.status(500).json({ message: 'Doctor or Patient not found.' });
//     }

//     // Set up the email data
//     const mailOptions = {
//       from: 'kavindumarasinghe70@gmail.com',
//       to: patient.email,
//       subject: 'Reservation Accepted',
//       text: `Accepted`,
//     };

//     // Send the email and handle potential errors
//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.error('Error sending email:', error);
//         // Send response even if email fails
//         return res.status(200).json({ success: true, message: 'Reservation accepted, but there was an error sending the email.' });
//       } else {
//         console.log('Email sent:', info.response);
//         return res.status(200).json({ success: true, message: 'Reservation accepted and email sent successfully!' });
//       }
//     });
    
//   } catch (err) {
//     console.error('Error accepting reservation:', err);
//     // Ensure that the response is only sent once
//     if (!res.headersSent) {
//       res.status(500).json({ message: 'Internal Server Error' });
//     }
//   }
// });




// // Route to reject a reservation
// Vrouter.post('/status/:reservationId/reject', async (req, res) => {
//   const { reservationId } = req.params;

//   try {
//     const reservation = await Reservation.findByIdAndUpdate(
//       reservationId,
//       { status: 'rejected' },
//       { new: true }
//     );

//     if (!reservation) {
//       return res.status(404).json({ message: 'Reservation not found.' });
//     }

//     res.status(200).json(reservation);
//   } catch (err) {
//     console.error('Error rejecting reservation:', err);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

Vrouter.post('/status/:reservationId/reject', async (req, res) => {
  const { reservationId } = req.params;

  try {
    const reservation = await Reservation.findByIdAndUpdate(
      reservationId,
      { status: 'rejected' },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found.' });
    }

    const doctor = await Doctor.findOne({ docID: reservation.doctorId });
    const patient = await Patient.findById(reservation.patientId);

    if (!doctor || !patient) {
      return res.status(500).json({ message: 'Doctor or Patient not found.' });
    }

    const mailOptions = {
      from: 'kavindumarasinghe70@gmail.com',
      to: patient.email,
      subject: 'Reservation Rejected',
      text: `Dear ${patient.name},\n\nI regret to inform you that your reservation scheduled for ${reservation.date.toDateString()} at ${reservation.timeSlot} has been rejected.\n\nDue to an important commitment, I am unavailable on that day. I apologize for any inconvenience this may cause.\n\nPlease contact the clinic to reschedule your appointment or find an alternative date and time that works for you.\n\nThank you for your understanding.\n\nBest regards,\nDr. ${doctor.name}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        req.flash('error', 'Reservation rejected, but there was an error sending the email.');
      } else {
        req.flash('success', 'Reservation rejected and email sent successfully!');
      }
      return res.redirect('/status'); // Redirect to the same page with success or error message
    });
  } catch (error) {
    console.error('Error:', error);
    req.flash('error', 'Server error.');
    return res.redirect('/status'); // Redirect with error message
  }
});


Vrouter.get('/BecomeDoctor', async (req, res) => {
  try {
    const patientId = req.session.userId;

    if (!patientId) {
      const errorMessage = 'Please log in as a patient';
      req.flash('error', errorMessage); // Store error message in flash
      return res.redirect('/login');    // Redirect to login if not logged in
    }

    // Retrieve any success or error messages from flash
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');

    // Render the 'BecomeDoctor' view with any messages to be displayed
    res.render('BecomeDoctor', { successMessage, errorMessage });
  } catch (err) {
    // Handle any errors that occur during rendering
    req.flash('error', 'An unexpected error occurred');
    res.status(500).json({ message: err.message });
  }
});







Vrouter.get('/doctorrec', async (req, res) => {
  try {
    // Step 1: Fetch all doctors from the Doctor collection
    const doctors = await Doctor.find();

    // Step 2: Extract all docIDs from doctors
    const doctorDocIds = doctors.map(doctor => doctor.docID);

    // Step 3: Fetch all patients from the Patient collection where docID exists in doctorDocIds
    const patients = await Patient.find({ docID: { $in: doctorDocIds } });

    // Step 4: Filter patients whose role is "patient"
    const filteredPatientIds = patients
      .filter(patient => patient.role === "patient")
      .map(patient => patient._id);

    // Step 5: Fetch doctors whose docID exists in filteredPatientIds and role is "patient"
    const drec = await Doctor.find({ docID: { $in: filteredPatientIds }, role: "patient" });

    // Check if the user is logged in as a patient
    const patientId = req.session.userId;
    if (!patientId) {
      req.flash('error', 'Please log in as a patient');
      return res.redirect('/login');
    }

    res.render('doctorrec', { drec, patientId }); // Pass the fetched doctors and patientId to the template
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).send('Internal Server Error');
  }
});


Vrouter.post('/updaterole/:id', async (req, res) => {
  try {
    const doctorId = req.params.id; // Get the doctor ID from request parameters

    // Fetch the doctor object using the doctorId
    const doctor = await Doctor.findById(doctorId);

    if (doctor) {
      const docId = doctor.docID; // Get the docID from the fetched doctor object

      // Find the patient by their _id (assuming this is the same as docID)
      const updatedPatient = await Patient.findByIdAndUpdate(docId, { role: 'doctor' }, { new: true });

      if (updatedPatient) {
        console.log(`Updated Patient: ${updatedPatient}`); // Log the updated patient details
        res.redirect('/');
      } else {
        console.log(`Patient with _id ${docId} not found`);
        res.status(404).send({ status: "Patient not found for the given _id" });
      }
    } else {
      console.log(`Doctor with ID ${doctorId} not found`);
      res.status(404).send({ status: "Doctor not found for the given ID" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "Error updating patient role", error: error.message });
  }
});



Vrouter.get('/clinicB', async (req, res) => {
  try {
    // Check if the user is logged in as a patient
    const patientId = req.session.userId;
    if (!patientId) {
      req.flash('error', 'Please log in as a patient');
      return res.redirect('/login');
    }

    // Fetch all patients from the database
    const patients = await Patient.find({ role: 'doctor' });

    // Create an array of patient IDs where the role is 'doctor'
    const patientIds = patients.map(patient => patient._id.toString());

    // Fetch doctors from the database where:
    // 1. The clinic is 'B'
    // 2. The docId matches any patient ID (that has the role 'doctor')
    // 3. The role is 'doctor' (only fetch doctors)
    const doctors = await Doctor.find({
      clinic: 'B',
      docID: { $in: patientIds }
    });

    // Render the 'clinicB' view, passing the filtered doctors array and patientId to the template
    res.render('clinicB', { doctors, patientId });

  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).send('Internal Server Error');
  }
});


Vrouter.get('/fetch', async (req, res) => {
  try {
    // Check if the user is logged in as a patient
    const patientId = req.session.userId;
    if (!patientId) {
      req.flash('error', 'Please log in as a patient');
      return res.redirect('/login');
    }

    // Fetch all patients from the database
    const patients = await Patient.find({ role: 'doctor' });

    // Create an array of patient IDs where the role is 'doctor'
    const patientIds = patients.map(patient => patient._id.toString());

    // Fetch doctors from the database where:
    // 1. The clinic is 'B'
    // 2. The docId matches any patient ID (that has the role 'doctor')
    // 3. The role is 'doctor' (only fetch doctors)
    const doctors = await Doctor.find({
      clinic: 'A',
      docID: { $in: patientIds }
    });

    // Render the 'clinicB' view, passing the filtered doctors array and patientId to the template
    res.render('fetch', { doctors, patientId });

  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).send('Internal Server Error');
  }
});



Vrouter.get('/NewAllDoc', async (req, res) => {
  try {
    // Fetch all doctors from the database where clinic is 'A'
    const doctors = await Doctor.find({});

    // const patientId = req.session.userId;
    

    // if (!patientId) {
    //   req.flash('error', 'Please log in as a patient');
    //   return res.redirect('/login');
    // }

    res.render('NewAllDoc', { doctors}); // Pass the 'doctors' array and 'patientId' to the template
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).send('Internal Server Error');
  }
});

Vrouter.get('/status', async (req, res) => {
  // Assuming you have a way to access the logged-in doctor's ID, such as from a session
    const loggedInDoctorId = req.session.userId; // Adjust this based on your authentication setup
    //console.log('Logged-in Doctor ID:', loggedInDoctorId)


  try {
      // Find reservations where the doctorId matches the logged-in doctor's ID
      const reservations = await reservation.find({ doctorId: loggedInDoctorId });

      //console.log('Retrieved Reservations:', reservations);

      // Render 'status.ejs' and pass the 'reservations' data
      res.render('status', { reservations: reservations });
  } catch (error) {
      console.error('Error fetching reservations:', error);
      // Handle any error that occurs during reservation retrieval
      res.status(500).send('Internal Server Error');
  }
});



Vrouter.get('/patientres', async (req, res) => {
  // Assuming you have a way to access the logged-in doctor's ID, such as from a session
    const loggedInDoctorId = req.session.userId; 
    const patientId = req.session.userId;
    

    if (!patientId) {
      req.flash('error', 'Please log in as a patient');
      return res.redirect('/login');
    }


  try {
      // Find reservations where the doctorId matches the logged-in doctor's ID
      const reservations = await reservation.find({ patientId: loggedInDoctorId });

      //console.log('Retrieved Reservations:', reservations);

      // Render 'status.ejs' and pass the 'reservations' data
      res.render('patientres', { reservations: reservations });
  } catch (error) {
      console.error('Error fetching reservations:', error);
      // Handle any error that occurs during reservation retrieval
      res.status(500).send('Internal Server Error');
  }
});





Vrouter.get('/adminedit/:id', async (req, res) => {
  try {
    const readquery = req.params.id;
    const record = await Patient.findById(readquery);
    
    if (record) {
      res.render('EditRole', { data: record });
    } else {
      // Handle case where the record with the given ID is not found
      res.status(404).send('Record not found');
    }
  } catch (error) {
    // Handle error if any occurs during the database operation
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

Vrouter.patch('/admintest/:id', async (req, res) => {
  
  try {
     // Get the user ID from the session
    const entryId = req.params.id; // Get the ID from URL parameter

    // Find the specific entry to update using its ID and the logged-in user's ID

    
    const updatedEntry = await Patient.findOneAndUpdate(
      { _id: entryId}, // Query condition
      {
        $set: {

          role: req.body.role,
         
          // Update other fields as needed
        }
  
      },
      { new: true } // To get the updated document after the update operation
    );
  0

    if (updatedEntry) {
      // Handle successful update
      req.flash('success', 'Entry updated successfully');
      res.redirect('/'); // Redirect to a success page or specific route
    } else {
      // Handle case where the entry to update wasn't found or the user isn't authorized
      req.flash('error', 'Failed to update entry');
      res.redirect('/');
    }
  } catch (error) {
    console.error(error);
    // Handle error case
    req.flash('error', 'Internal server error');
    res.redirect('/');
  }
});


Vrouter.delete("/del/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await Patient.findByIdAndDelete(userId);

    if (deletedUser) {
      // res.status(200).send({ status: "User deleted", user: deletedUser });
      res.redirect('/');
      
    } else {
      
      res.status(404).send({ status: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "Error deleting user", error: error.message });
  }
});


// Vrouter.delete("/del/:id", async (req, res) => {
//   try {
//     const userId = req.params.id;

//     // First, delete the patient by userId
//     const deletedUser = await Patient.findByIdAndDelete(userId);

//     if (deletedUser) {
//       // Now, delete the corresponding doctor whose docId matches the userId
//       const deletedDoctor = await Doctor.findOneAndDelete({ docID: userId });

//       if (deletedDoctor) {
//         // Both patient and doctor deleted successfully
//         res.redirect('/');
//       } else {
//         // Doctor not found, but patient was deleted
//         console.warn(`Patient deleted, but no doctor found with docID: ${userId}`);
//         res.redirect('/');
//       }
//     } else {
//       // Patient not found
//       res.status(404).send({ status: "User not found" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ status: "Error deleting user", error: error.message });
//   }
// });



Vrouter.get('/clinic/:_id', async (req, res) => {
  try {
    // Debug: Log route parameters
    console.log('Route Parameters:', req.params);

    const patientId = req.session.userId;
    if (!patientId) {
      req.flash('error', 'Please log in as a patient');
      return res.redirect('/login');
    }

    const patients = await Patient.find({ role: 'doctor' });
    // console.log('Fetched Doctors:', patients);
    const patientIds = patients.map(patient => patient._id.toString());

    const clinicId = req.params._id;
    // console.log('Requested Clinic ID:', clinicId);

    const clinic = await Clinic.findOne({ _id: clinicId, cstatus: 'accepted' });
    console.log(clinic)
    if (!clinic) {
      return res.status(404).send('Clinic not found or not accepted');
    }

    const doctors = await Doctor.find({
      clinic: clinic.clinicName,
      docID: { $in: patientIds }
    });
    // console.log('Fetched Doctors:', doctors);

    res.render('clinicdefult', { clinic, doctors, patientId });

  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).send('Internal server error');
  }
});

// Vrouter.get('/home', async (req, res) => {
//   try {
//     // Fetch clinics from the database
//     const clinics = await Clinic.find(); // Assuming Clinic is your model

//     // Render the home page with clinics data
//     res.render('home', { clinics });
//   } catch (error) {
//     console.error('Error fetching clinics:', error);
//     req.flash('error', 'Error loading clinics');
//     res.redirect('/');
//   }
// });

Vrouter.post('/update-hours', async (req, res) => {
  console.log(req.body);
  const { docID, startTime, endTime } = req.body;

  if (!docID || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
      // Find the doctor by docID
      const doctor = await Doctor.findOne({ docID: docID });
      
      if (!doctor) {
          return res.status(404).json({ message: 'Doctor not found' });
      }

      // Update startTime and endTime
      doctor.startTime = startTime;
      doctor.endTime = endTime;

      await doctor.save();

    // Flash success message and redirect
    req.flash('success', 'Working hours updated successfully');
    //return res.redirect('/home'); // Redirect to the same page or another page
  } catch (error) {
    console.error('Error updating working hours:', error);
    req.flash('error', 'Server error');
    //return res.redirect('/home'); // Redirect with error message
  }
});



// Route to accept the clinic
Vrouter.post('/clinic/:_id/accept', async (req, res) => {
  try {
    const clinicId = req.params._id;
    await Clinic.findByIdAndUpdate(clinicId, { cstatus: 'accepted' });
    res.redirect('/clinic'); // Redirect to the clinic list after acceptance
  } catch (error) {
    console.error('Error accepting clinic:', error);
    res.status(500).send('Internal server error');
  }
});

// Route to reject the clinic
Vrouter.post('/clinic/:_id/reject', async (req, res) => {
  try {
    const clinicId = req.params._id;
    await Clinic.findByIdAndUpdate(clinicId, { cstatus: 'rejected' });
    res.redirect('/clinic'); // Redirect to the clinic list after rejection
  } catch (error) {
    console.error('Error rejecting clinic:', error);
    res.status(500).send('Internal server error');
  }
});


// Vrouter.post('/reservationForm', async (req, res) => {
//   try {
//     const { date, timeSlot, message, docID, patientId } = req.body;

//     // Create a new reservation entry
//     const newReservation = new Reservation({
//       doctorId: docID,
//       patientId,
//       date,
//       timeSlot,
//       message
//     });

//     // Save the reservation to the database
//     await newReservation.save();

//     // Redirect or respond with success
//     res.redirect('/thank-you'); // You can redirect to a thank-you page or another route
//   } catch (error) {
//     console.error('Error saving reservation:', error);
//     res.status(500).send('Error processing reservation');
//   }
// });


// Vrouter.post('/reservationForm', async (req, res) => {
//   try {
//     const { date, timeSlot, message, docID, patientId } = req.body;

//     // Create a new reservation entry
//     const newReservation = new Reservation({
//       doctorId: docID,
//       patientId,
//       date,
//       timeSlot,
//       message
//     });

//     // Save the reservation to the database
//     await newReservation.save();

//     // Fetch doctor and patient details
//     const doctor = await Doctor.findOne({ docID });
//     const patient = await Patient.findById(patientId);

//     if (!doctor || !patient) {
//       return res.status(500).send('Doctor or Patient not found.');
//     }

//     // Configure the email options
//     const mailOptions = {
//       from: 'kavindumarasinghe70@gmail.com',
//       to: doctor.email, // Send email to the patient
//       subject: 'New Reservation',
//       text: `Dear Dr. ${doctor.name},

//       We are pleased to inform you that a new reservation has been made for your consultation services.
      
//       Reservation Details:
//       - Date: ${date}
//       - Time: ${timeSlot}
//       - Patient: ${patient.name}
      
//       Please ensure you are available at the scheduled time to attend to the patient. If you need to reschedule or have any queries, kindly contact the clinic administration.
      
//       Thank you for your continued service and dedication.
      
//       Best regards,
//       [Clinic Team]`
//           };
//     // Send the email to the patient
//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.error('Error sending email:', error);
//         return res.status(200).send('Reservation made, but there was an error sending the email.');
//       } else {
//         // Redirect or respond with success
//         res.redirect('/patientres'); // You can redirect to a thank-you page or another route
//       }
//     });
//   } catch (error) {
//     console.error('Error saving reservation:', error);
//     res.status(500).send('Error processing reservation');
//   }
// });


Vrouter.post('/reservationForm', async (req, res) => {
  try {
    const { date, timeSlot, message, docID, patientId } = req.body;

    // Check for overlapping reservations
    const existingReservations = await Reservation.find({
      doctorId: docID,
      date: date
    });

    const isOverlapping = existingReservations.some(reservation => {
      // Assuming timeSlot is a string in 'HH:mm' format and stored similarly in reservations
      const [requestedStart, requestedEnd] = timeSlot.split(' - ').map(t => new Date(`1970-01-01T${t}:00`));
      const [existingStart, existingEnd] = reservation.timeSlot.split(' - ').map(t => new Date(`1970-01-01T${t}:00`));

      return (requestedStart < existingEnd && requestedEnd > existingStart);
    });

    if (isOverlapping) {
      return res.status(400).send('The requested time slot is already taken.');
    }

    // Create a new reservation entry
    const newReservation = new Reservation({
      doctorId: docID,
      patientId,
      date,
      timeSlot,
      message
    });

    // Save the reservation to the database
    await newReservation.save();

    // Fetch doctor and patient details
    const doctor = await Doctor.findOne({ docID });
    const patient = await Patient.findById(patientId);

    if (!doctor || !patient) {
      return res.status(500).send('Doctor or Patient not found.');
    }

    // Configure the email options
    const mailOptions = {
      from: 'kavindumarasinghe70@gmail.com',
      to: doctor.email, // Send email to the doctor
      subject: 'New Reservation',
      text: `Dear Dr. ${doctor.name},

      We are pleased to inform you that a new reservation has been made for your consultation services.
      
      Reservation Details:
      - Date: ${date}
      - Time: ${timeSlot}
      - Patient: ${patient.name}
      
      Please ensure you are available at the scheduled time to attend to the patient. If you need to reschedule or have any queries, kindly contact the clinic administration.
      
      Thank you for your continued service and dedication.
      
      Best regards,
      [Clinic Team]`
    };

    // Send the email to the doctor
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(200).send('Reservation made, but there was an error sending the email.');
      } else {
        // Redirect or respond with success
        res.redirect('/patientres'); // You can redirect to a thank-you page or another route
      }
    });
  } catch (error) {
    console.error('Error saving reservation:', error);
    res.status(500).send('Error processing reservation');
  }
});






module.exports = Vrouter;
