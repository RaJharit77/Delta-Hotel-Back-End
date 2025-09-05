import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

async function main() {
    try {
        const dataPath = path.resolve(__dirname, '../data/data.json')
        const rawData = await fs.promises.readFile(dataPath, 'utf8')
        const data = JSON.parse(rawData)[0]

        for (const chambre of data.chambres) {
            await prisma.chambre.create({
                data: {
                    id: uuidv4(),
                    img: chambre.img,
                    titre: chambre.titre,
                    description: chambre.description
                }
            })
        }

        for (const conciergerie of data.conciergeries) {
            await prisma.conciergerie.create({
                data: {
                    id: uuidv4(),
                    title: conciergerie.title,
                    description: conciergerie.description,
                    imgSrc: conciergerie.imgSrc,
                    alt: conciergerie.alt
                }
            })
        }

        for (const spa of data.spaCards) {
            await prisma.spa.create({
                data: {
                    id: uuidv4(),
                    img: spa.img,
                    alt: spa.alt,
                    title: spa.title,
                    description: spa.description
                }
            })
        }

        for (const service of data.autresServices) {
            await prisma.autreService.create({
                data: {
                    id: uuidv4(),
                    img: service.img,
                    titre: service.titre,
                    description: service.description
                }
            })
        }

        console.log('Migration terminée avec succès!')
    } catch (error) {
        console.error('Erreur lors de la migration:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()