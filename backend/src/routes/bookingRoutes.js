const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.post('/create', bookingController.createBooking);
router.post('/cancel', bookingController.cancelBooking);
router.get('/availabilities', bookingController.getAvailabilities);
router.get('/my-bookings', bookingController.getFarmerBookings);

module.exports = router;
