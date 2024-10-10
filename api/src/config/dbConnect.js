import mongoose from 'mongoose'

async function connectDatabase(){
    mongoose.connect(process.env.MONGO_CONNECTION)
    return mongoose.connection
}

export default connectDatabase