import mongoose, { version } from "mongoose";

const usersSchema = new mongoose.Schema({
    id: {type: mongoose.Schema.Types.ObjectId},
    username: {
        type: String,
        required: true,
        unique: true
      },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/\S+@\S+\.\S+/, 'is invalid']
    },
    password: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        required: true,
        enum: ['admin', 'empresario', 'usuario'],  
        default: 'usuario'  
    },
    cashback: {
        type: Number,
        default: 0
    }
}, {versionKey: false})

const user = mongoose.model("Usuario", usersSchema);
export default user;
