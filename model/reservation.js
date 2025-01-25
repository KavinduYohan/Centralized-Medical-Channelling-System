const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true,
    unique: true
  },
  message: String,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
});


reservationSchema.pre('save', async function (next) {
  const existingReservation = await mongoose.models.Reservation.findOne({
    doctorId: this.doctorId,
    date: this.date,
    timeSlot: this.timeSlot,
    status: { $ne: 'rejected' }
  });

  if (existingReservation) {
    const error = new Error('Time slot is already reserved for this doctor on the specified date.');
    error.status = 400;
    return next(error);
  }
  next();
});

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;
