import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
    img: String,
    titre: String,
    description: String
});

const Service = mongoose.model('Service', serviceSchema);

export default Service;
