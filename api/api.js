import express from 'express'
import imagesRouter from './images.js'
import Contact from '../models/contact.js'
const router = express.Router()

router.use('/images', imagesRouter)

router.post('/contacts/insert', async (req, res) => {
    const newContact = new Contact(req.body)
    try {
        await newContact.save()
    } catch (err) {
        res.status(500).send(err)
    }
    res.json({ success: true })
})

export default router
