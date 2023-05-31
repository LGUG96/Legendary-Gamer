const express=require('express');
const router=express.Router();
const gameModel=require('../models/gamemodel');
const adminModel=require('../models/admin');
const commentsModel=require('../models/comments');
const replyModel=require('../models/reply');
const Blog=require('../models/blog');
const multer=require('multer');
const fs=require('fs');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const axios = require('axios');

var storageoptions= multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"./uploads");
    },
    filename:function(req,file,cb){
cb(null, file.fieldname+"_"+Date.now()+"_"+file.originalname);
    }
});
 var upload=multer({
    storage:storageoptions,
 }).single("gameimg");

router.post('/addgame',upload,(req,res)=>{
    var linkman={linktype:req.body.linktype,link:req.body.gamelink}
    const gamemodel= new gameModel({
        name:req.body.gamename,
        description:req.body.des,
        gamecategoryone:req.body.cateone,
        gamecategorytwo:req.body.catetwo,
        gamecategorythree:req.body.catethree,
        gamecategoryfour:req.body.catefour,
        developer:req.body.developer,
        installnotes:req.body.installnotes,
        publisher:req.body.publisher,
        releasedate:req.body.releasedate,
        systemrequirement:req.body.systemrequirement,
        filesize:req.body.filesize,
        gameimage:req.file.filename,

    })
    gamemodel.save((err)=>{
        if(err){
            res.json({message:err.message, type: 'danger'});

        }else{
            gamemodel.links.push(linkman);
            gamemodel.save();
            req.session.message={
                type:'success',
                message:'User added successfully!'
            };
            gameModel.find().exec((err,games)=>{
                if(err){
                    res.json({message:err.message});
                }else{
                    res.render("admin",{title:'Admin',header:"Admin dashboard",allgames:games});
                }
                  });
        }
    });
})



/*router.get("/",(req,res)=>{
    res.render("index",{title:'The home page',header:"The homepage"});
}
);*/

//get all games

router.get('/', (req, res) => {
    // Render the home page using EJS
    res.redirect('/games');
  });

router.get("/games",(req,res)=>{
    const page = req.query.page || 1; // Default to page 1 if no page is specified
    const limit = 6; // Number of results per page
    const skip = (page - 1) * limit; // Number of documents to skip

    gameModel.countDocuments((error, count) => {
        if (error) {
          console.error(error);
        } else {
          console.log(`There are ${count} items in the collection.`);
          const pages = Math.ceil(count / limit);
        const random = Math.floor(Math.random() * count);
//random was skip
  gameModel.find().skip(random).limit(6).exec((err,games)=>{
if(err){
    res.json({message:err.message});
}else{
    gameModel.find({}).sort({createddate: 'descending'}).limit(5).exec((err, sidegames) => {
        // the `items` array will contain the 10 most recently added items
      
    res.render("index",{title:'Legendary Games',header:"LG",allgames:games,sidegames:sidegames,page:page,pages:pages});
});
}
  });
}
});
}
);

//pagination bro


router.get("/page",(req,res)=>{
    const page = req.query.page || 1; // Default to page 1 if no page is specified
    const limit = 2; // Number of results per page
    const skip = (page - 1) * limit; // Number of documents to skip

    gameModel.countDocuments((error, count) => {
        if (error) {
          console.error(error);
        } else {
          console.log(`There are ${count} items in the collection.`);
          const pages = Math.ceil(count / limit);
        
const random = Math.floor(Math.random() * count);
//skip random wasn't there
  gameModel.find().skip(random).limit(2).exec((err,games)=>{
if(err){
    res.json({message:err.message});
}else{
    gameModel.find({}).sort({createddate: 'descending'}).limit(5).exec((err, sidegames) => {
        // the `items` array will contain the 10 most recently added items
      
    res.render("index",{title:'Legendary Games',header:"LG",allgames:games,sidegames:sidegames,page:page,pages:pages});
});
}
  });
}
});
}
  );




router.get("/addgame",(req,res)=>{
      if (!req.isAuthenticated()) {
    return res.redirect('/login'); // Redirect to the login page if not authenticated
  }
    res.render("addgame",{title:'The home page',header:"Legendary Gamers"});
}
);

router.get("/edit/:id",(req,res)=>{
    let id =req.params.id;
    gameModel.findById(id,(err,games)=>{
        if(err){
            res.redirect('/admin');
        }else{
            if(games==null){
                res.redirect('/admin');
            }else{

                res.render("editgame",{title:"edit games",header:"Edit game",thegame:games,});
            }
        }
    })
}
);
//delete image
router.get("/deleteimage/:id/:gameid",upload,(req,res)=>{
  let id=req.params.id;
  let gameid=req.params.gameid;
  try{
    fs.unlinkSync('./uploads/'+id)
}catch(err){
console.log(err);
}
res.redirect("/edit/"+gameid);
})
//update
router.post("/update/:id",upload,(req,res)=>{
    var linkman={linktype:req.body.linktype,link:req.body.gamelink}
let id=req.params.id;
let new_image='';
    if(req.file){
        new_image=req.file.filename;
        try{
            fs.unlinkSync('./uploads/'+req.body.oldimage)
        }catch(err){
console.log(err);
        }

    }else{
        new_image=req.body.oldimage;
    }


  gameModel.findByIdAndUpdate(id,{

    name:req.body.gamename,
        description:req.body.des,
        gamecategoryone:req.body.cateone,
        gamecategorytwo:req.body.catetwo,
        gamecategorythree:req.body.catethree,
        gamecategoryfour:req.body.catefour,
        $push: { links: linkman } ,
        developer:req.body.developer,
        installnotes:req.body.installnotes,
        publisher:req.body.publisher,
        releasedate:req.body.releasedate,
        filesize:req.body.filesize,
        systemrequirement:req.body.systemrequirement,
        gameimage:new_image,

  },(err,result)=>{
    if (err){
        res.json({message:err.message,type:"failed"});
    }else{





        req.session.message={
            type:"success",
            message:"Game updated successfully"
        };
        res.redirect("/admin");
    }
  })  
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
    }
  });

const uploadman = multer({ storage: storage });
router.post('/addimg', uploadman.single('screenimg'), (req, res) => {
    let id=req.body.gameid.trim();
    var img={screenshots:req.file.filename}
//console.log(img);
gameModel.updateOne({ _id: id }, { $push: { screenshots: req.file.filename } }, (err, result) => {
  
  });
    console.log(req.file);
    
    res.redirect('/edit/'+id);
   // res.send('File uploaded successfully');
  });
  






router.get("/register",(req,res)=>{
res.render("registeradmin",{title:"Admin",header:"Register Admin"});
});
// Handling user signup

router.post("/register", function (req, res) {
    var username = req.body.username
    var password = req.body.password
    var adminemail=req.body.adminemail
    adminModel.register(new adminModel({ username: username,email:adminemail }),
            password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render("registeradmin",{title:"Admin",header:"Register Admin"});
        }
 
        passport.authenticate("local")(
            req, res, function () {
                gameModel.find().exec((err,games)=>{
                    if(err){
                        res.json({message:err.message});
                    }else{
                        res.render("admin",{title:'Logged in',header:"The homepage",allgames:games});
                    }
                      });
            
        });
    });
});

//Showing login form
router.get("/login", function (req, res) {
    res.render("login",{title:'Log in',header:"Admin Login"});
});
 
//Handling user login
router.post("/login", passport.authenticate("local", {
    
    failureRedirect: "/login"
}), function (req, res) {
    gameModel.find().sort({ createddate: 'desc' }).exec((err,games)=>{
        if(err){
            res.json({message:err.message});
        }else{
            res.render("admin",{title:'Admin Dashboard',header:"The homepage",allgames:games});
        }
          });
});
 
//Handling user logout

router.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/login');
    });
  });
 
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/admin");
}
// Showing secret page
router.get("/admin", isLoggedIn, function (req, res) {
    res.render("login");
});

router.post('/getgames', async  (req,res)=>{
let payload=req.body.payload.trim();
console.log(payload);
let search=await gameModel.find({name:{$regex: new RegExp('^'+payload+'.*','i')}}).exec();
//limit results to 10
search=search.slice(0,10);
res.send({payload: search});

});

router.post('/proto', async (req, res) => {
    //let page = req.query.page ? parseInt(req.query.page) : 1;
    let page = req.body.page;
    let limit = 4;
    let payload = req.body.payload.trim();
    console.log(payload);
    console.log(page);
    let search = await gameModel.find({$or: [ { gamecategoryone: payload }, { gamecategorytwo: payload }, { gamecategorythree: payload }, { gamecategoryfour: payload } ]})
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    let count = await gameModel.countDocuments({$or: [ { gamecategoryone: payload }, { gamecategorytwo: payload }, { gamecategorythree: payload }, { gamecategoryfour: payload } ]});
    let pages = Math.ceil(count / limit);
    
    res.send({
      payload: search,
      page: page,
      pages: pages
    });
  });
// add link
router.post("/addlink",async (req,res)=>{
    let category=req.body.cate.trim();
    let down=req.body.downman.trim();
    let id=req.body.id.trim();
    var linkman={linktype:category,link:down}
   console.log(id)
   console.log(category)
   console.log(down)
   gameModel.findByIdAndUpdate(id,{

        $push: { links: linkman }
    

  },(err,result)=>{
    if (err){
        res.json({message:err.message,type:"failed"});
        console.log(err.message);
    }else{
        
    }})

});

//delete link

router.get('/deletelink/:id/:gamelink',(req,res)=>{
    let id=req.params.id;
    let gameid=req.params.gamelink
    console.log(gameid)
    console.log(id)
    gameModel.findById(gameid)
    .then(doc => {
      doc.links.pull(id);
      return doc.save();
    })
    .then(() => {
        res.redirect('/edit/'+gameid)
    });

})

// delete image

router.get('/deleteimage/:id/:gamelink',(req,res)=>{
    let id=req.params.id;
    let gameid=req.params.gamelink
    console.log(gameid)
    console.log(id)
    gameModel.findById(gameid)
    .then(doc => {
      doc.links.pull(id);
      return doc.save();
    })
    .then(() => {
        res.redirect('/edit/'+gameid)
    });

})




//delete game

router.get('/delete/:id',(req,res)=>{
    let id=req.params.id;
   
   
    console.log(id)
    gameModel.deleteOne({ _id: id })
    .then(() => {
      // code to execute after the item has been deleted
      res.redirect('/login')
    });
})
router.get('/gamedetails/:id',(req,res)=>{
    let id=req.params.id;
    gameModel.findById(id,(err,particulargame)=>{
        if(err){
            res.redirect('/');
        }else{
            if(particulargame==null){
                res.redirect('/');
            }else{
                gameModel.find({}).sort({createddate: 'descending'}).limit(5).exec((err, sidegames) => {
                    // the `items` array will contain the 10 most recently added items
                  
               // res.render("index",{title:'Pcgames',header:"Download Pc games",allgames:games,});
                res.render("gamedetails",{title:particulargame.name,header:particulargame.name,particulargame:particulargame,
                    sidegames:sidegames});
            });
               
            }
        }
    })

})


router.post('/comments', async (req, res) => {
   var gameid=req.body.gameid;
    const comment = new commentsModel({
      gameid:req.body.gameid,
      email:req.body.commentoremail,
      
      commentorname: req.body.commentorname,
      comment: req.body.realcomment
    });
    await comment.save();
    res.redirect('/gamedetails/'+gameid);
  });
  
  router.get('/comments', async (req, res) => {
    const comments = await commentsModel.find();
    res.json(comments);
  });
  router.get('/comments/:id', async (req, res) => {
    const comment = await commentsModel.find({ gameid: req.params.id });
    res.json(comment);
  });
  router.post('/replycomments', async (req, res) => {
      var gameid=req.body.gameid;
    const reply = new replyModel({
      commentId: req.body.parentcomment,
      message: req.body.replymessage,
      replyemail: req.body.commentoremailr,
      name: req.body.commentornamer
    });
    await reply.save();
    res.redirect('/gamedetails/'+gameid);
  });
  router.get('/repliesget/:id', async (req, res) => {
    const replies = await replyModel.find({ commentId: req.params.id });
    res.json(replies);
  });
  
  //search....................................
  router.get("/search",(req,res)=>{
    const page = req.query.page || 1; // Default to page 1 if no page is specified
    const limit = 2; // Number of results per page
    const skip = (page - 1) * limit; // Number of documents to skip
    let query = req.query.searchitem;

    // Perform the search

    gameModel.countDocuments({ name: { '$regex': new RegExp('^'+query+'.*','i') } }, function(err, count) {
        if (err) {
          console.error(err);
          return;
        }
      
        let pages = Math.ceil(count / limit);
        console.log("Pages: "+pages);
        console.log("Count: "+count);
  //gameModel.find().skip(random).limit(2).exec((err,games)=>{
    gameModel.find({
        name: {
          $regex: new RegExp('^' + query + '.*', 'i')
        }
      }).skip(skip).limit(2).exec((err,games)=>{
  if(err){
    res.json({message:err.message});
}else{
    gameModel.find({}).sort({createddate: 'descending'}).limit(5).exec((err, sidegames) => {
        // the `items` array will contain the 10 most recently added items
      
    res.render("search",{title:'Legendary Games',header:"LG",allgames:games,sidegames:sidegames,page:page,pages:pages,searchitem:query});
});
}
  });
});
});

router.get("/services",(req,res)=>{
  res.render("services",{title:'Services',header:"Services"});
}
);

router.get("/terms",(req,res)=>{
  res.render("terms",{title:'Terms and conditions',header:"Terms and conditions"});
}
);
router.get("/privacy",(req,res)=>{
  res.render("privacy",{title:'Privacy Policy',header:"Privacy Policy"});
}
);
router.get("/about",(req,res)=>{
  res.render("about",{title:'About Us',header:"About Us"});
}
);

router.get("/contact",(req,res)=>{
  res.render("contact",{title:'Contact Us',header:"Contact Us"});
}
);

router.get("/donatenow",(req,res)=>{
  res.render("donate",{title:'Donate',header:"Donate"});
}
);

router.get("/gamerequests",(req,res)=>{
  res.render("gamerequests",{title:'Game Requests',header:"Game Requests"});
}
);

router.get("/blogadmin", async (req, res) => {
        if (!req.isAuthenticated()) {
      return res.redirect('/login'); // Redirect to the login page if not authenticated
    }
  try {
    const blogs = await Blog.find();
    res.render("blogadmin", {
      title: "Blog section",
      header: "Blog section",
      blogs: blogs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving blogs");
  }
});
// Set up body parser middleware to parse request bodies
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// POST route to handle form submission
router.post('/contact', (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const message = req.body.message;

  // Create a transporter object to send the email
  const transporter = nodemailer.createTransport({
    host: 'downloadpcgamesl.com',
    port: 465,
    secure: true,
    auth: {
        user: 'admin@downloadpcgamesl.com',
        pass: 'legend123G@mer'
    }
});

  // Set up the email options
  const mailOptions = {
    from: 'admin@downloadpcgamesl.com',
    to: 'admin@downloadpcgamesl.com',
    subject: `New message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent: ' + info.response);
      res.send({message: 'Email sent to admin!'})
    }
  });
});

router.get('/donate', async (req, res) => {
  // Create a new transaction
  try {
    const { data } = await axios.post('https://www.coinpayments.net/api/v1/create_transaction', {
      'version': 1,
      'key': process.env.COINPAYMENTS_API_KEY,
      'cmd': 'create_transaction',
      'amount': req.query.amount,
      'currency1': 'USD',
      'currency2': 'BTC',
      'buyer_email': req.query.email,
      'item_name': 'Donation to My Wallet',
      'custom': 'donation'
    });

    // Redirect to CoinPayments checkout page
    res.redirect(data.result.status_url);
  } catch (err) {
    console.error(err);
    res.send('An error occurred while processing your payment');
  }
});

router.post('/game-request', (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const game = req.body.game;

  // Create a transporter object to send the email
  const transporter = nodemailer.createTransport({
    host: 'downloadpcgamesl.com',
    port: 465,
    secure: true,
    auth: {
        user: 'admin@downloadpcgamesl.com',
        pass: 'legend123G@mer'
    }
  });

  // Set up the email options
  const mailOptions = {
    from: 'admin@downloadpcgamesl.com',
    to: 'admin@downloadpcgamesl.com',
    subject: `New game request from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nGame Request: ${game}`
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent: ' + info.response);
      res.send({message: 'Email sent to admin!'});
    }
  });
});
// Set up multer storage
const storageblog = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
  }
});

// Create multer instance
const uploadpic = multer({ storage: storageblog });

// Handle POST request to create a new blog
router.post('/blogman', uploadpic.single('blogimage'), async (req, res) => {
  try {
    const {blogtitle, blog } = req.body;
    const blogimage = req.file ? req.file.filename : null;

    // Create new blog instance
    const newBlog = new Blog({  blogtitle,blog, blogimage });

    // Save new blog to database
    await newBlog.save();

    // Redirect to homepage
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating blog');
  }
});


/*
router.get('/blog', async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.render('blog', { blogs: blogs,title:'Blog',header:"Blog" });
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/blog/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    res.json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});
*/
router.post('/blogadmin/:id', async (req, res) => {
  const blogId = req.params.id;

  try {
    // Delete the blog post from the database
    await Blog.findByIdAndDelete(blogId);

    // Redirect to the blog admin page
    res.redirect('/blogadmin');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting blog post');
  }
});

//blogtest
router.get('/blog', async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.render('blog', { blogs: blogs,title:'Blog',header:"Blog" });
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/blog-details/:id?', async (req, res) => {
  try {
    if (req.params.id) {
      const blogId = req.params.id;
      const blog = await Blog.findById(blogId);
      const blogs = await Blog.find();

      if (!blog) {
        return res.status(404).send('Blog not found');
      }

      return res.render('blog-details', { blogs:blogs,blog: blog, title: blog.blogtitle });
    }

    const blogs = await Blog.find();
    res.render('blog', { blogs: blogs, title: 'Blog', header: 'Blog' });
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/blog/:id/edit', (req, res, next) => {
  // Find the blog by ID
  Blog.findById(req.params.id, (err, blog) => {
    if (err) {
      return next(err);
    }
    // Render the edit form with the blog data
    res.render('edit-blog', { blog: blog,title: blog.blogtitle });
  });
});

const storageblogtwo = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
  }
});

// Create multer instance
const uploadmn = multer({ storage: storageblogtwo });

router.post('/blog/:id', uploadmn.single('blogimage'), (req, res) => {
  const blogId = req.params.id;
  const { blog, blogtitle } = req.body;
  const blogimage = req.file ? req.file.filename : null; // Use file.filename instead of file.path

  // Convert the blog content to a string
  const blogContent = Array.isArray(blog) ? blog.join('') : blog;

  Blog.findById(blogId, (err, foundBlog) => {
    if (err) {
      console.log(err);
    } else {
      foundBlog.blog = blogContent;
      foundBlog.blogtitle = blogtitle;
      if (blogimage) {
        foundBlog.blogimage = blogimage.replace('uploads/', ''); // Remove 'uploads/' from the path
      }

      foundBlog.save((err, updatedBlog) => {
        if (err) {
          console.log(err);
        } else {
          res.redirect('/blog-details/' + updatedBlog._id);
        }
      });
    }
  });
});


module.exports=router;