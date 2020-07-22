import express from 'express'
import axios from 'axios'
import User from '../models/user.js'

const router = express.Router()

router.post('/login', async (req, res) => {
    const { access_token } = req.body
    const { data } = await axios({
        url: 'https://graph.facebook.com/me',
        method: 'get',
        params: {
            fields: ['id', 'email', 'first_name', 'last_name'].join(','),
            access_token
        }
    })

    return res.json({
        member: await User.exists({ id: data.id }),
        ...data
    })
})

router.post('/register', async (req, res) => {
    const newUser = new User(req.body)
    try {
        const result = await newUser.save()
        res.json(req.body)
    } catch (err) {
        res.status(500).send(err)
    }
})

export default router
