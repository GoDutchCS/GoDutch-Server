import mongoose from 'mongoose'

const userSchema = mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: String,
    account_number: {
        type: String,
        required: true
    },
    bank_type: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: true
    },
}, {
    collection: 'users'
})

export default mongoose.model('User', userSchema)
