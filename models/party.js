import mongoose from 'mongoose'

const Transaction = {
    title: {
        type: String,
        required: true
    },
    date: { // yyyy-MM-dd format
        type: String,
        required: true
    },
    participants: {
        type: [String],
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    cashflow: {
        from: {
            type: String,
            required: true
        },
        to: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        }
    }
}

const partySchema = mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    members: {
        type: [String] ,
        required: true
    },
    transactions: {
        type: [
            Transaction
        ],
        required: false
    }
}, {
    collection: 'parties'
})

export default mongoose.model('Party', partySchema)
