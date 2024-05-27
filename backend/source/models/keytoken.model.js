'use strict'
const {model,Schema,Types} = require('mongoose'); // Erase if already required


const DOCUMENT_NAME='Key'
const COLLECTION_NAME='Keys'
// Declare the Schema of the Mongo model


const keyTokenSchema = Schema({
    user:{
        type:Types.ObjectId,
        required:true,
        ref:'User'
    },
    publicKey:{
        type:String,
        required:true,
    },
    refreshTokensUsed:{//used token, check if anyone use our old token, this must be hacker
        type:Array,
        default:[]
    },
    refreshToken:{
        type:String,
        required:true
    }
},{
    collection:COLLECTION_NAME,
    timestamps:true
});

//Export the model
module.exports = model(DOCUMENT_NAME, keyTokenSchema);