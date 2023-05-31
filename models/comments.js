const mongoose=require('mongoose');

const gameComments= new mongoose.Schema({
    gameid:{
        type:String,
        required:true
    },
    commentorname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    comment:{
        type:String,
        required:true
    },
    createddate:{
        type:Date,
        required:true,
        default:Date.now,
    },

});


module.exports=mongoose.model("Comments",gameComments);