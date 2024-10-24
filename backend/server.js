import cors from 'cors';
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT || 5000;
const dbPath = process.env.DB_PATH || './database.db';

//SQLite
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erreur lors de l\'ouverture de la base de données:', err.message);
    } else {
        console.log('Connected to SQLite database.');

        db.run(`
            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT,
                subject TEXT,
                message TEXT
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS reservations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT,
                phone TEXT,
                check_in TEXT,
                check_out TEXT,
                room_type TEXT,
                guest INTEGER
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS services (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                img TEXT,
                titre TEXT,
                description TEXT,
                alt TEXT
            )
        `);
    }
});

// Origin autorisé
const allowedOrigins = [
    'https://delta-hotel-madagascar.vercel.app',
    'https://delta-hotel-madagascar.onrender.com',
    'http://localhost:5173'
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

app.use((req, res, next) => {
    res.setTimeout(10000, () => {  // Timeout fixé à 10 secondes
        console.log('Request has timed out.');
        res.status(504).send('Request timed out');
    });
    next();
});

// Charger les données de services en mémoire et les insérer dans la base de données
const loadServicesData = async () => {
    try {
        const data = await fs.readFile(path.join(__dirname, './data/data.json'), 'utf8');
        const services = JSON.parse(data);
        console.log('Données chargées:', services);

        // Vérifiez que les propriétés sont des tableaux avant d'itérer
        const insertService = (service) => {
            return new Promise((resolve, reject) => {
                db.run('INSERT INTO services (img, titre, description, alt) VALUES (?, ?, ?, ?)',
                    [service.img, service.titre, service.description, service.alt || ''],
                    (err) => {
                        if (err) reject(err);
                        resolve();
                    });
            });
        };

        // Supprimer les anciennes données
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM services', (err) => {
                if (err) reject(err);
                resolve();
            });
        });

        const serviceTypes = ['chambres', 'conciergeries', 'spaCards', 'autresServices'];

        for (const type of serviceTypes) {
            if (!services[type]) {
                console.error(`${type} est manquant dans le fichier JSON`);
                continue; // Skip this type if it's missing
            }
            if (!Array.isArray(services[type])) {
                console.error(`${type} n'est pas un tableau dans le fichier JSON`);
                continue; // Skip this type if it's not an array
            }
            for (const service of services[type]) {
                await insertService(service);
            }
        }        

        console.log('Données des services chargées dans la base de données.');
    } catch (error) {
        console.error('Erreur lors du chargement des données de services:', error);
    }
};

// Charger les données au démarrage du serveur
db.serialize(async () => {
    await loadServicesData();
});

// API pour les services
app.get('/api/services', async (req, res) => {
    try {
        db.all('SELECT * FROM services', [], (err, rows) => {
            if (err) {
                console.error('Error fetching services:', err);
                res.status(500).json({ message: 'Internal server error', error: err.message });
            } else {
                res.json(rows);
            }
        });
    } catch (err) {
        console.error('Error fetching services:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});

// API pour les contacts
app.post('/api/contacts', async (req, res) => {
    const contactData = req.body;

    if (!contactData.name || !contactData.email || !contactData.message) {
        return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    try {
        const result = await db.run(
            'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
            [contactData.name, contactData.email, contactData.message]
        );
        res.status(200).json({ message: 'Message envoyé avec succès.', contactId: result.lastID });
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        res.status(500).json({ message: 'Erreur lors de l\'envoi du message.', error: error.message });
    }
});

// API pour les réservations
app.post('/api/reservations', async (req, res) => {
    const { fullName, email, phone, checkIn, checkOut, roomType, guests } = req.body;

    if (!fullName || !email || !phone || !checkIn || !checkOut || !roomType || !guests) {
        return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    try {
        const result = await db.run(
            'INSERT INTO reservations (name, email, phone, check_in, check_out, room_type, guest) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [fullName, email, phone, checkIn, checkOut, roomType, parseInt(guests)]
        );
        res.status(200).json({ message: 'Réservation réussie.', reservationId: result.lastID });
    } catch (error) {
        console.error('Erreur lors de la réservation:', error);
        res.status(500).json({ message: 'Erreur lors de la réservation.', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});