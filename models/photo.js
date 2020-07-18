import mongoose from 'mongoose'

const photoSchema = mongoose.Schema({
    id: String,
    photos: [String]
}, {
    collection: 'photos'
})

export default mongoose.model('Photo', photoSchema)
