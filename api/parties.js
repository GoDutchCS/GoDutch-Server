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

router.get('/list/:id', async (req, res) => {
    const { id } = req.params

    try {
        const result = await Party.aggregate([
            {
                $match: {
                    members: {
                        $in: [ id, '$members' ]
                    }
                }
            }
        ])
        res.json(result)
    } catch (err) {
        res.status(500).send(err)
    }
})

router.get('/transactions/:id', async (req, res) => {
    const { id } = req.params
    try {
        const result = await Party.aggregate([
            {
                $match: { id }
            },
            {
                $unwind: '$transactions'
            },
            {
                $project: {
                    title: '$transactions.title',
                    date: '$transactions.date'
                }
            },
            {
                $group: {
                    _id: '$date',
                    titles: {
                        $push: '$title'
                    }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ])
        res.json(result)
    } catch (err) {
        res.status(500).send(result)
    }
})

router.get('/single/:id', async (req, res) => {
    const { id } = req.params
    try {
        const result = await Party.findOne({ id })
        res.json(result)
    } catch (err) {
        res.status(500).send(err)
    }
})

export default router
