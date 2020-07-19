import mongoose from 'mongoose'

const photoSchema = mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    photos: [String]
}, {
    collection: 'photos'
})

export default mongoose.model('Photo', photoSchema)
