const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Slot = require('./model/slots'); 
const Doctor = require('./model/doctor')
const moment = require('moment');
const app = express();
const port = 3000;

const mongoURI = 'mongodb+srv://balajisadhasivam11:0QrVaoksS5Vwnc9E@hospitalbot.uqhejq1.mongodb.net/?retryWrites=true&w=majority&appName=Hospitalbot';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/getDoctors', async (req, res) => {
  try {
    const doctors = await Doctor.find({}, { providerId: 1 });
    res.json(doctors);
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).send('Server error');
  }
});

// Generate slots for the upcoming month
app.post('/addSlots', async (req, res) => {
  const startHour = 9;
  const endHour = 19;
  
  try {
    const doctors = await Doctor.find({}, { providerId: 1 });
    const slots = [];

    // Generate slots for the upcoming month
    for (let i = 0; i < 30; i++) {
      const date = moment().add(i, 'days').format('YYYY-MM-DD');

      doctors.forEach(doctor => {
        for (let hour = startHour; hour < endHour; hour++) {
          const time = `${hour < 10 ? '0' : ''}${hour}:00`;
          slots.push({
            providerId: doctor.providerId,
            date,
            time,
            bookedStatus: false
          });
        }
      });
    }

    await Slot.insertMany(slots);
    res.status(201).json(slots);
  } catch (err) {
    console.error('Error adding slots:', err);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
