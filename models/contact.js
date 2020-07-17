import mongoose from 'mongoose'

const contactSchema = mongoose.Schema({
    name: String,
    number: String,
    email: String
}, {
    collection: 'contacts'
})

export default mongoose.model('Contact', contactSchema)
