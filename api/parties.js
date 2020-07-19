import express from 'express'
import Party from '../models/party.js'
const router = express.Router()

router.post('/add', async (req, res) => {
    let { id, members } = req.body

    if (id === "") {
        try {
            const count = await Party.count({}) + 1
            id = `Party ${count.toString()}`
        } catch (err) {
            return res.status(500).send(err)
        }
    }

    const newParty = new Party({ id, members, transactions: [] })

    try {
        await newParty.save()
    } catch (err) {
        return res.status(500).send(err)
    }

    res.json({ success: true })
})

export default router
