import Store from "./store"
import mongoose from "mongoose"

const Schema = mongoose.Schema

let User = new Schema({
    username:String,
    password:String,
    email:String,
    role:Number,
    department:{
        type:Schema.Types.ObjectId,
        ref:"Store"
    }
})

export default mongoose.model("User", User , "user")