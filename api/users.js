import express from 'express'
import Contact from '../models/contact.js'
import User from '../models/user.js'
import Party from '../models/party.js'
import { getNamesMapAll } from '../utils/utils.js'
const router = express.Router()

/*
 * /api/users/list/:id
 * Retrieve the information of people that are members among the contacts of person 'id'
 * the reponse contains one key, `result`, which is an array of objects that have the keys
 * id(owner of number), name, number, and email
 */
router.get('/list/:id', async (req, res) => {
    const { id } = req.params
    const result = await Contact.aggregate([
        {
            $match: { id }
        },
        {
            $project: { id: 1, contacts: 1 }
        },
        {
            $unwind: '$contacts'
        },
        {
            $lookup: {
                from: 'users',
                let: { number: '$contacts.number' },
                pipeline: [{
                    $match: {
                        $expr: {
                            $eq: [ '$phone_number', '$$number' ]
                        }
                    }
                }],
                as: 'registered'
            }
        },
        {
            $unwind: '$registered'
        },
        {
            $project: {
                id: '$registered.id',
                name: '$contacts.name',
                number: '$contacts.number',
                email: '$contacts.email',
            }
        }
    ])

    res.json({ result })
})

// /api/users/single/:id
router.get('/single/:id', async (req, res) => {
    const { id } = req.params
    try {
        const doc = await User.findOne({ id })
        res.json(doc)
    } catch (err) {
        res.status(500).send(err)
    }
})

// /api/users/multiple/:id
router.get('/multiple', async (req, res) => {
    const { users } = req.query

    try {
        const result = await User.find({ id: { $in: users } })
        res.json(result)
    } catch (err) {
        res.status(500).send(err)
    }
})

// /api/users/peopleiowe/:id
router.get('/peopleiowe/:id', async (req, res) => {
    const { id } = req.params
    try {
        const relatedTransactions = await Party.aggregate([
            { $match: { $expr: { $in: [ id, '$members' ] } } },
            { $unwind: '$transactions' },
            { $project: { date: '$transactions.date', id: '$id', title: '$transactions.title', cashflow: '$transactions.cashflow'} },
            { $unwind: '$cashflow' },
            { $project: { date: 1, id: 1, title: 1, from: '$cashflow.from', to: '$cashflow.to', amount: '$cashflow.amount', completed: '$cashflow.completed', cashflow_id: '$cashflow.id' } },
            { $match: { completed: false, $or: [{ from: id }, { to: id }] } },
            { $group: { _id: '$id', id: { $first: '$id' }, transactions: { $push: { date: '$date', title: '$title', from: '$from', to: '$to', amount: '$amount', completed: '$completed', cashflow_id: '$cashflow_id' } } } }
        ])

        const result = relatedTransactions.reduce((acc, rt) => {
            const { transactions } = rt;
            const partyID = rt.id
            const dict = {}

            transactions.forEach(tr => {
                if (id === tr.from) {
                    if (tr.to in dict)
                        dict[tr.to] += tr.amount
                    else
                        dict[tr.to] = tr.amount
                } else {
                    if (tr.from in dict)
                        dict[tr.from] -= tr.amount
                    else
                        dict[tr.from] = -tr.amount
                }
            })

            const partyResult = Object.keys(dict).reduce((innerAcc, innerCur) =>
                dict[innerCur] < 0 ?
                    innerAcc :
                    ([ ...innerAcc, { id: partyID, to: innerCur, amount: dict[innerCur] } ]), [])
            if (partyResult.length === 0)
                return acc
            else
                return [ ...acc, ...partyResult ]
        }, [])

        const namesMap = await getNamesMapAll()
        res.json({ namesMap, result })
    } catch (err) {
        res.status(500).send(err)
    }
})

export default router
