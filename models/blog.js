const mongoose=require('mongoose');

const blogdata= new mongoose.Schema({

    blogtitle:{
        type:String,
        required:true
    },
    blog:{
        type:String,
        required:true
    },
    blogimage:{
        type:String,
        required:false
    },
    createddate:{
        type:Date,
        required:true,
        default:Date.now,
    },

});


module.exports=mongoose.model("Blog",blogdata);