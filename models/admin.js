const mongoose=require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
const adminSchema= new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    createddate:{
        type:Date,
        required:true,
        default:Date.now,
    },

});
// plugin for passport-local-mongoose
adminSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model("admin",adminSchema);