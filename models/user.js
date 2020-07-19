import mongoose from 'mongoose'

const userSchema = mongoose.Schema({
    id: String,
    first_name: String,
    last_name: String,
    email: String,
    account_number: String,
    phone_number: String,
}, {
    collection: 'users'
})

export default mongoose.model('User', userSchema)
