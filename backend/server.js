import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import Contact from './models/Contacts.js';
import Reservation from './models/Reservation.js';
import Service from './models/Services.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

//origin autorized
const allowedOrigins = [
    'https://delta-hotel-madagascar.vercel.app',
    'https://delta-hotel-madagascar.onrender.com'
];

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const mongoURI = `mongodb+srv://rajoharitianaraharison:rajharit_77@delta-hotel.p2j3y.mongodb.net/deltaHotel?retryWrites=true&w=majority&appName=Delta-Hotel`;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connecté'))
    .catch(err => console.error('Erreur de connexion à MongoDB:', err));

//api
//services
/**
app.get('/api/services', async (req, res) => {
    try {
        const data = await fs.readFile(path.resolve(__dirname, './data/data.json'), 'utf8');
        const hotelItems = JSON.parse(data);
        res.json(hotelItems);
    } catch (error) {
        console.error('Error reading menu data:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

//contacts
app.post('/api/contacts', async (req, res) => {
    const contactData = req.body;

    console.log('Données de contact reçues:', contactData);

    try {
        const dataPath = path.join(__dirname, './data/contacts.json');
        const existingData = await fs.readFile(dataPath, 'utf8');
        const contacts = JSON.parse(existingData || '[]');
        contacts.push(contactData);
        await fs.writeFile(dataPath, JSON.stringify(contacts, null, 2));
        res.status(200).json({ message: 'Message envoyé avec succès.'});
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        res.status(500).json({ message: 'Erreur lors de l\'envoi du message.'});
    }
});

//reservations
app.post('/api/reservations', async (req, res) => {
    console.log('Réservation reçue:', req.body);

    const reservationData = req.body;

    try {
        const dataPath = path.join(__dirname, './data/reservations.json');
        const existingData = await fs.readFile(dataPath, 'utf8');
        const reservations = JSON.parse(existingData || '[]');
        reservations.push(reservationData);
        await fs.writeFile(dataPath, JSON.stringify(reservations, null, 2));
        console.log('Réservation enregistrée avec succès:', reservationData);
        res.status(200).json({ message: 'Réservation effectuée avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la réservation:', error);
        res.status(500).json({ message: 'Erreur lors de la réservation.' });
    }
});
*/
//MongoDB
//Services
app.get('/api/services', async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (error) {
        console.error('Error fetching services:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//reservations
app.post('/api/reservations', async (req, res) => {
    console.log('Réservation reçue:', req.body);

    const reservationData = new Reservation(req.body); // Créer une instance du modèle

    try {
        await reservationData.save(); // Enregistrer dans la base de données
        console.log('Réservation enregistrée avec succès:', reservationData);
        res.status(200).json({ message: 'Réservation effectuée avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la réservation:', error);
        res.status(500).json({ message: 'Erreur lors de la réservation.' });
    }
});

//Contacts
app.post('/api/contacts', async (req, res) => {
    const contactData = new Contact(req.body);

    try {
        await contactData.save();
        res.status(200).json({ message: 'Message envoyé avec succès.' });
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        res.status(500).json({ message: 'Erreur lors de l\'envoi du message.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});