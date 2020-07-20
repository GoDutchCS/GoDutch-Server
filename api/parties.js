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

// endpoint to retrieve transactions grouped by date
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
                    date: '$transactions.date',
                    total: '$transactions.total',
                    buyer: '$transactions.buyer',
                    cashflow: '$transactions.cashflow'
                }
            },
            {
                $group: {
                    _id: '$date',
                    transactions: {
                        $push: {
                            title: '$title',
                            buyer: '$buyer',
                            cashflow: '$cashflow',
                            total: '$total'
                        }
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

router.post('/:id/transactions/add', async (req, res) => {
    const { id } = req.params
    const { title, buyer, method, participants, total } = req.body
    const date = new Date().toISOString().substring(0, 10)

    console.log(req.body)
    if (method === 'N-Bread') {
        const cashflow = participants.map((participant, idx) => ({
            from: participant,
            to: buyer,
            amount: total / (1 + participants.length),
            completed: false,
            id: idx
        }))

        const newTransaction = { title, date, buyer, participants, total, cashflow }
        const result = await Party.updateOne(
            { id },
            {
                $push: {
                    transactions: newTransaction
                }
            }
        )
        res.json({ success: true })
    } else {
        res.status(500).send("Not Supported")
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
