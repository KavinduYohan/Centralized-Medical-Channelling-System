const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  clinic: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  about: {
    type: String
  },
  slmcNumber: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: String,
    required: true,
  },
  proof: {
    type: String
  },
  docID: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'patientRegister' 
  },
  email: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    default: '09:00' // Default start time
  },
  endTime: {
    type: String,
    default: '17:00' // Default end time
  },
  slots: {
    type: [String],
    default: [] // Start with an empty array 
  }
});

// Function to calculate slots based on startTime and endTime
function calculateSlots(startTime, endTime) {
  const slotsArray = [];
  
  // Helper function to convert time string to Date object
  const timeToDate = (timeStr) => {
    const [hour, minute] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
  };
  
  // Convert time strings to Date objects
  const startDate = timeToDate(startTime);
  const endDate = timeToDate(endTime);

  // Generate slots
  while (startDate < endDate) {
    const startTimeStr = startDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const nextSlot = new Date(startDate.getTime());
    nextSlot.setMinutes(nextSlot.getMinutes() + 30);

    const endTimeStr = nextSlot.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    slotsArray.push(`${startTimeStr} - ${endTimeStr}`);

    // Move to next slot
    startDate.setMinutes(startDate.getMinutes() + 30);
  }

  return slotsArray;
}

// Pre-save middleware to recalculate slots before saving
doctorSchema.pre('save', function(next) {
  if (this.isModified('startTime') || this.isModified('endTime')) {
    this.slots = calculateSlots(this.startTime, this.endTime);
  }
  next();
});




module.exports = mongoose.model('Doctor', doctorSchema);
