'use strict'

const{model,Schema} = require('mongoose');
const DOCUMENT_NAME='User'
const COLLECTION_NAME='Users'

// Declare the Schema of the Mongo model
const userSchema = new Schema({
    name:{
        type:String,
        trim:true,//clear white/blank space
        maxLength:150
    },
    salt:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        trim:true,
    },
    password:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        enum:['active','inactive'],
        default:'inactive'
    },
    verify:{
        type:Schema.Types.Boolean,
        default:false
    },
    roles:{
        type:Array,
        default:[]
    }
},{
    timestamps:true,
    collection:COLLECTION_NAME
}
);

//Export the model
module.exports = model(DOCUMENT_NAME, userSchema);