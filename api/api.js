import express from 'express'
import Contact from '../models/contact.js'
const router = express.Router()

router.post('/contacts/insert', async (req, res) => {
    const exists = await Contact.exists({ id: req.body.id })

    if (exists) {
        try {
            await Contact.updateOne(
                { id: req.body.id },
                [{
                    $addFields: {
                        contacts: {
                            $reduce: {
                                input: req.body.contacts,
                                initialValue: '$contacts',
                                in: {
                                    $cond: [
                                        { $in: [ '$$this.number', '$contacts.number' ] },
                                        '$$value',
                                        { $concatArrays: [ [ '$$this' ], '$$value' ] }
                                    ]
                                }
                            }
                        }
                    }
                }]
            )
        } catch (err) {
            res.status(500).send(err)
        }
        res.json({ success: true })
    } else {
        const newContact = new Contact(req.body)
        try {
            await newContact.save()
        } catch (err) {
            res.status(500).send(err)
        }
        res.json({ success: true })
    }
})

export default router
