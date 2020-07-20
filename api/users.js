import express from 'express'
import Contact from '../models/contact.js'
import User from '../models/user.js'
const router = express.Router()

/*
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

router.get('/single/:id', async (req, res) => {
    const { id } = req.params
    try {
        const doc = await User.findOne({ id })
        res.json(doc)
    } catch (err) {
        res.status(500).send(err)
    }
})

export default router
