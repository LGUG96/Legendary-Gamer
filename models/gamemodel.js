const mongoose=require('mongoose');
const gameSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    gamecategoryone:{
        type:String,
        required:true
    },
    gamecategorytwo:{
        type:String,
        required:false
    },
    gamecategorythree:{
        type:String,
        required:false
    },
    gamecategoryfour:{
        type:String,
        required:false
    },
    
    links:[{linktype:String,link:String}],
    screenshots:[String],
       
    developer:{
        type:String,
        required:false
    },
    publisher:{
        type:String,
        required:false
    },
    releasedate:{
        type:String,
        required:false
    },
    filesize:{
        type:String,
        required:false
    },
    systemrequirement:{
        type:String,
        required:false
    },
    installnotes:{
        type:String,
        required:false
    },
    gameimage:{
        type:String,
        required:true
    },
    createddate:{
        type:Date,
        required:true,
        default:Date.now,
    },

});

module.exports=mongoose.model("games",gameSchema);