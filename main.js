require('dotenv').config();
const express=require('express');
const mongoose=require('mongoose');
const session=require('express-session');
const admin=require('./models/admin');
passport = require("passport")
var LocalStrategy = require("passport-local")
var passportLocalMongoose =require("passport-local-mongoose")
const app=express();

const port=process.env.PORT || 4000

//database connection
mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology:true});
const db=mongoose.connection;
db.on('error', (error)=>console.log(error));
db.once('open',()=>console.log('Connected to database!'));

//middleware
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(
    session({
        secret: "my secret key",
        saveUninitialized:true,
        resave:false,
    })
);
app.use((req,res,next)=>{
    res.locals.message=req.session.message;
    delete req.session.message;
    next();
});


app.set("view engine","ejs");
//statics
app.use(express.static('public'));
app.use(express.static('uploads'));
app.use('/css',express.static(__dirname+'public/css'))
app.use('/js',express.static(__dirname+'public/js'))
app.use('/img',express.static(__dirname+'public/img'))

//router
app.use(passport.initialize());
app.use(passport.session());
 
passport.use(new LocalStrategy(admin.authenticate()));
passport.serializeUser(admin.serializeUser());
passport.deserializeUser(admin.deserializeUser());
app.use("",require("./routes/routes"));






app.listen(port,()=>{console.info(`Listening on port:${port}`)})