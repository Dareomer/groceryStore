import mongoose from "mongoose"

const Schema = mongoose.Schema

const Store = new Schema({
    name:String,
    parentId:{
        type:Schema.Types.ObjectId,
        ref:"Store",
        default:null
    },
    parents:[{
        type:Schema.Types.ObjectId,
        ref:"Store"
    }]
})

export default mongoose.model("Store", Store , "store")