import User from '../models/user.js'

export const getNamesMap = async ids => {
    const names = await Promise.all(ids.map(async id => {
        const user = await User.findOne({ id })
        return `${user.first_name}`
    }))

    return ids.reduce((acc, cur, idx) => ({
        ...acc,
        [cur]: names[idx]
    }), {})
}

export const getNamesMapAll = async () => {
    const all = await User.find({})

    return all.reduce(
        (acc, cur) => ({ ...acc, [cur.id]: cur.first_name }),
        {}
    )
}
