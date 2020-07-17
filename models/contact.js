import mongoose from 'mongoose'

const contactSchema = mongoose.Schema({
    id: String,
    contacts: [{
        name: String,
        number: String,
        email: String
    }]
}, {
    collection: 'contacts'
})

export default mongoose.model('Contact', contactSchema)
