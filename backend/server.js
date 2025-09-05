import cors from 'cors'
import express from 'express'
import { prisma } from './lib/prisma.js'
import { v4 as uuidv4 } from 'uuid'

const app = express()
const PORT = process.env.PORT || 5000

const allowedOrigins = [
    'https://delta-hotel-madagascar.vercel.app',
    'https://delta-hotel-madagascar.onrender.com',
    'http://localhost:5173'
]

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}

app.use(cors(corsOptions))
app.use(express.json())

// API pour les services
app.get('/api/services', async (req, res) => {
    try {
        const [chambres, conciergeries, spaCards, autresServices] = await Promise.all([
            prisma.chambre.findMany(),
            prisma.conciergerie.findMany(),
            prisma.spa.findMany(),
            prisma.autreService.findMany()
        ])

        res.json([{
            chambres,
            conciergeries,
            spaCards,
            autresServices
        }])
    } catch (err) {
        console.error('Error fetching data:', err)
        res.status(500).json({ message: 'Internal server error', error: err.message })
    }
})

// API pour les contacts
app.post('/api/contacts', async (req, res) => {
    const { name, email, subject, message } = req.body

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Tous les champs sont requis.' })
    }

    try {
        const contact = await prisma.contact.create({
            data: {
                id: uuidv4(),
                name,
                email,
                subject,
                message
            }
        })
        res.status(200).json({ message: 'Message envoyé avec succès.', contactId: contact.id })
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error)
        res.status(500).json({ message: 'Erreur lors de l\'envoi du message.', error: error.message })
    }
})

// API pour les réservations
app.post('/api/reservations', async (req, res) => {
    const { fullName, email, phone, checkIn, checkOut, roomType, guests } = req.body

    if (!fullName || !email || !phone || !checkIn || !checkOut || !roomType || !guests) {
        return res.status(400).json({ message: 'Tous les champs sont requis.' })
    }

    try {
        const reservation = await prisma.reservation.create({
            data: {
                id: uuidv4(),
                name: fullName,
                email,
                phone,
                check_in: checkIn,
                check_out: checkOut,
                room_type: roomType,
                guest: parseInt(guests)
            }
        })
        res.status(200).json({ message: 'Réservation réussie.', reservationId: reservation.id })
    } catch (error) {
        console.error('Erreur lors de la réservation:', error)
        res.status(500).json({ message: 'Erreur lors de la réservation.', error: error.message })
    }
})

app.use((req, res) => {
    res.status(404).json({ message: 'Route non trouvée.' })
})

app.use((req, res, next) => {
    res.setTimeout(10000, () => {
        console.log('Request has timed out.')
        res.status(504).send('Request timed out')
    })
    next()
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})