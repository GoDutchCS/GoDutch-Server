import express from 'express'
import multer from 'multer'
import fs from 'fs'
import Photo from '../models/photo.js'

const router = express.Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { id } = req.body
        const dir = `/tmp/uploads/${id}`

        if (!fs.existsSync(dir))
            fs.mkdirSync(dir, { recursive: true })

        cb(null, dir)
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage })

router.post('/upload', upload.array('photos'), async (req, res) => {
    const { id } = req.body
    const filenames = req.files.map(e => e.path)
    const exists = await Photo.exists({ id })

    if (exists) {
        try {
            await Photo.updateOne(
                { id },
                {
                    $addToSet: {
                        photos: filenames
                    }
                }
            )
        } catch (err) {
            res.status(500).send(err)
        }
    } else {
        const newGallery = new Photo({
            id,
            photos: filenames
        })

        try {
            await newGallery.save()
        } catch (err) {
            return res.status(500).send(err)
        }
    }

    res.json({ success: true })
})

router.get('/list/:id', async (req, res) => {
    const { id } = req.params
    try {
        const docs = await Photo.findOne({ id })
        const photos = docs.photos.map(path => path.startsWith('/tmp') ? path.substring(4) : path)
        res.json({ photos })
    } catch (err) {
        res.json({ photos: [] })
    }
})

router.post('/delete', async (req, res) => {
    const { id, photos } = req.body

    try {
        await Photo.updateOne(
            { id },
            {
                $pull: {
                    photos: { $in: photos }
                }
            }
        )
        photos.forEach(path => { fs.unlinkSync(path) })
    } catch (err) {
        return res.status(500).send(err);
    }

    const doc = await Photo.findOne({ id })
    const photoPaths = doc.photos.map(path => path.startsWith('/tmp') ? path.substring(4) : path)
    res.json({ success: true, photos: photoPaths })
})

export default router
