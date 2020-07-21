import express from 'express'
import Party from '../models/party.js'
import { getNamesMap } from '../utils/utils.js'
const router = express.Router()

const initializeGraph = ids =>
    ids.reduce((acc, cur) => ({
        ...acc,
        [cur]: ids.reduce((innerAcc, innerCur) => innerCur !== cur ? ({
            ...innerAcc,
            [innerCur]: 0
        }) : innerAcc, {})
    }), {})


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
            { $match: { id } },
            { $unwind: '$transactions' },
            { $project: {
                    title: '$transactions.title',
                    date: { $substrBytes: ['$transactions.date', 0, 10] },
                    time: { $substrBytes: [ '$transactions.date', 11, 16 ] },
                    total: '$transactions.total',
                    buyer: '$transactions.buyer',
                    cashflow: '$transactions.cashflow'
            } },
            { $unwind: '$cashflow' },
            { $match: { 'cashflow.completed': false } },
            { $group: {
                _id: '$title',
                title: { $first: '$title' },
                date: { $first: '$date' },
                total: { $first: '$total' },
                buyer: { $first: '$buyer' },
                time: { $first: '$time' },
                cashflow: { $push: '$cashflow' }
            } },
            { $group: { _id: '$date', transactions: { $push: { title: '$title', buyer: '$buyer', cashflow: '$cashflow', total: '$total', time: '$time' } } } }
        ])

        res.json(result)
    } catch (err) {
        res.status(500).send(result)
    }
})

router.post('/transactions/complete', async (req, res) => {
    const { party_id, title, cashflow_id } = req.body
    try {
        const result = await Party.update(
            { id: party_id },
            { $set: { 'transactions.$[outer].cashflow.$[inner].completed': true } },
            { arrayFilters: [{ 'outer.title': title }, { 'inner.id': cashflow_id }] }
        )
        res.json({ success: true })
    } catch (err) {
        res.status(500).send(err)
    }
})

router.post('/:id/transactions/add', async (req, res) => {
    const { id } = req.params
    const { title, buyer, method, participants, total } = req.body
    const date = new Date().toISOString().substring(0, 19)

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

router.get('/:id/resolve', async (req, res) => {
    const { id } = req.params
    const { members } = await Party.findOne({ id })
    const graph = initializeGraph(members)
    const namesMap = await getNamesMap(members)
    const cashFlows = await Party.aggregate([
        {
            $match: { id }
        },
        {
            $unwind: '$transactions'
        },
        {
            $project: {
                date: '$transactions.date',
                cashflow: '$transactions.cashflow'
            }
        },
        {
            $unwind: '$cashflow'
        },
        {
            $project: {
                from: '$cashflow.from',
                to: '$cashflow.to',
                amount: '$cashflow.amount',
                cashflowID: '$cashflow.id',
                date: 1
            }
        }
    ])

    cashFlows.forEach(({ date, from, to, amount }) => {
        if (amount > graph[to][from]) {
            graph[from][to] += (amount - graph[to][from]);
            graph[to][from] = 0;
        } else
            graph[to][from] -= amount;
    })

    const result = Object.keys(graph).reduce(
        (acc, cur) => {
            const filtered = Object.keys(graph[cur]).reduce((innerAcc, innerCur) => graph[cur][innerCur] === 0 ? innerAcc : ({...innerAcc, [innerCur]: graph[cur][innerCur]}),{})
            return Object.keys(filtered).length === 0 ? acc : ({ ...acc, [cur]:  filtered})
        },
        {}
    )

    res.json({ result, namesMap })
})

export default router
