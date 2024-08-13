const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const Doctor = require('./model/doctor');
const Slot = require('./model/slots');
const user = require('./model/appt');
const cron = require('node-cron');
const app = express();
const port = 3000;
const mongoURI = 'mongodb+srv://balajisadhasivam11:0QrVaoksS5Vwnc9E@hospitalbot.uqhejq1.mongodb.net/?retryWrites=true&w=majority&appName=Hospitalbot';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

  async function removePastDates() {
    try {
      const today = moment().startOf('day'); 
      
      const result = await Slot.deleteMany({
        date: { $lt: today.format('YYYY-MM-DD') }
      });
  
      console.log(`${result.deletedCount} past slot(s) removed.`);
    } catch (err) {
      console.error('Error removing past slots:', err);
    }
  }
  
  
  removePastDates();

app.use(express.urlencoded({ extended: true }));
app.post('/getDoctors', async (req, res) => {
  const { speciality } = req.body;
  try {
    const doctors = await Doctor.find({ providerSpeciality: speciality });
    res.json(doctors);
  } catch (err) {
    res.status(500).send(err);
  }
})

app.post('/getAvailableSlots', (req, res) => {
  const { providerId } = req.body;

  Slot.find({ providerId: providerId, bookedStatus: false })
    .then((slots) => {
      if (slots.length === 0) {
        return res.status(404).send('No available slots found');
      }
      const availableSlots = slots.map(slot => ({
        date: slot.date,
        time: slot.time
      }));
      res.status(200).json(availableSlots);
    })
    .catch(err => {
      console.error('Error fetching available slots:', err);
      res.status(500).send('Server error');
    });
});

app.post('/checkSlots', (req, res) => {
  console.log('Request received:', req.body);
  if (!req.body.providerId || !req.body.scheduleDate || !req.body.scheduleTime) {
    return res.status(400).send('Missing required parameters');
  }
  const inputTime = moment(req.body.scheduleTime, 'HH:mm:ssZ'); 
  const formattedInputTime = inputTime.format('HH:mm'); 

  if (!inputTime.isValid()) {
    return res.status(400).send('Invalid time format');
  }

  Slot.findOne({
    providerId: req.body.providerId,
    date: req.body.scheduleDate,
    time: formattedInputTime
  })
    .then((result) => {
      console.log('Slot found:', result);

      if (result === null) {
        return res.status(404).send('No slot found');
      } else {
        if (!result.bookedStatus) {
          return res.status(200).json(result);
        } else {
          return res.status(404).send('Slot not available');
        }
      }
    })
    .catch(err => {
      console.error('Error:', err);
      res.status(500).send('Server error');
    });
});


app.post('/updateSlots', (req, res) => {
  console.log('Request received:', req.body);

  let inputTime;
  try {
    inputTime = moment.tz(req.body.scheduleTime, 'HH:mm:ssZ', 'UTC');
    if (!inputTime.isValid()) {
      return res.status(400).send('Invalid time format');
    }
  } catch (error) {
    return res.status(400).send('Invalid time format');
  }

  const formattedInputTime = inputTime.format('HH:mm');

  Slot.findOne({ providerId: req.body.providerId, date: req.body.scheduleDate, time: formattedInputTime })
    .then((result) => {
      console.log('Slot found:', result);

      if (result === null) {
        res.sendStatus(404);
      } else {
        if (!result.bookedStatus) {
          result.bookedStatus = true;
          result.save()
            .then(() => {
              const bookingId = req.body.bookingId; // Ensure bookingId is sent in request

              if (bookingId) {
                const appointment = new user({
                  patientName: req.body.patientName || '', 
                  providerName: result.providerName || '', 
                  speciality: req.body.speciality || '', 
                  date: req.body.scheduleDate || '', 
                  time: formattedInputTime || '', 
                  contactNumber: req.body.contactNumber || '', 
                  bookingId: bookingId || ''
                });

                appointment.save()
                  .then(() => {
                    console.log('Appointment saved successfully with booking ID');
                    res.status(200).json({
                      message: 'Slot booked successfully',
                      providerName: result.providerName,
                      bookingId: bookingId
                    });
                  })
                  .catch(err => {
                    console.error('Error saving appointment:', err);
                    res.status(500).send('Server error');
                  });
              } else {
                res.status(400).send('Booking ID is missing');
              }
            })
            .catch(err => {
              console.error('Error saving slot:', err);
              res.status(500).send('Server error');
            });
        } else {
          res.sendStatus(404);
        }
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send('Server error');
    });
});

app.post('/insert',(req,res)=>{
  console.log(req.body)
  user.create(req.body)
  res.send('user created')
})
  
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
