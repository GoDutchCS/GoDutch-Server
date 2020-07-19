import mongoose from 'mongoose'

const contactSchema = mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    contacts: [{
        name: String,
        number: String,
        email: String
    }]
}, {
    collection: 'contacts'
})

export default mongoose.model('Contact', contactSchema)
