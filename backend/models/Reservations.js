import mongoose from 'mongoose';

const ReservationSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    roomType: { type: String, required: true },
    guests: { type: Number, required: true },
}, { timestamps: true });

const Reservation = mongoose.model('Reservation', ReservationSchema);

export default Reservation;
