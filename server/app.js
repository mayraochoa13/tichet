//jshint esversion:6
const { response } = require("express");
const express = require("express");

const app = express();

const mongoose  = require("mongoose");

// pass in authRole middleware 
const { loggedIn, uAdminOrOwner,uOwner } = require('./roleAuth'); 

// going to use three packages and installing using npm 

// express session 
const session = require('express-session'); 

// passport js 
const passport = require('passport'); 

// passport-local-mongoose 
const passportLocalMongoose = require('passport-local-mongoose'); 

// also passport-local but i do not need to require it but it was installed 
// npm i passport passport-local passport-local-mongoose express-session 


// require body parser 
const bodyParser = require("body-parser"); 

// use ejs 
app.set('view engine' , 'ejs');


// use body parser 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended:true }));

// connecting css to the server
const path = require('path')
app.use('/static', express.static(path.join(__dirname, 'public')))

// start session 
app.use(session({
    secret:"any string",
    resave: false,
    saveUninitialized: false
})); 

// initialize passport 
app.use(passport.initialize());

// use passport to deal with session 
app.use(passport.session()); 

// import database schema 
//import Ticket from "./models/ticket"; 

// import model 
 
const Ticket = require('./models/ticket');
const User = require('./models/User'); 

mongoose.connect("mongodb+srv://adminSaul:test123@cluster0.pyekv.mongodb.net/SampleDB?retryWrites=true&w=majority" , {useNewUrlParser: true , useUnifiedTopology: true}); 

// passport local configurations 
passport.use(User.createStrategy()); 

// serialise creates a cookie 
passport.serializeUser(User.serializeUser()); 

// decode cookie message 
passport.deserializeUser(User.deserializeUser());

// activate filter value 
// let filterName = 0 ; 
// let noFilter  = 0 ; 
// let filterAge = 0 ; 
let filterVal = 0;
// activate filter /ManageUsers 
let query = null; 


// timestamp in seconds 
app.get("/test", function(req, res){ 
    User.find({}, function(err, result){
        if(!err){
            res.render('manage_users', {users : result});
         }
         console.log(result);
    });
});

//app.get("/", function(req, res){
app.get("/",  uAdminOrOwner, loggedIn,  function(req, res){
    // this is the route we want to make sure user is authenticated 
        // 1) filters by name
        // 2) filters by age
        // 3) undo the work
        switch(filterVal){
            case "1":
                Sample.find().sort({name:1}).exec(function( err, sortedUsers){
                    if( !err ){
                        res.render('dashboard' , { dataList : sortedUsers }); 
                    }
                });
                break;
            case "2":
                Sample.find().sort({age:1}).exec(function( err, sortedUsersByAge){

                    if( !err ){
                        res.render('dashboard' , { dataList : sortedUsersByAge }); 
                    }
                });
                break;   
            default: 
                Sample.find({}, function( err, foundUsers){
                // found all the documents and stored them on found users 
                    if( ! err){
                        res.render('dashboard', { dataList : foundUsers}); 
                    }
                }); 
                break;
        }
  
}); 

app.post("/trigger", function( require, response){

    // filterName = require.body.filterName; 
    // noFilter = require.body.undoFilter; 
    // filterAge = require.body.filterAge; 
    filterVal = require.body.filter

    response.redirect("/")

}); 

app.get("/home", function( req, res){
    res.render("home"); 
}); 


app.get("/login", function( req , res ){
    res.render("login");
}); 

app.get('/register', function( req , res ){
    res.render("register");
}); 

// lets collect user details to register and authenticate 
app.post('/register', function( req , res ){
    
    // use method register from the passport mongoose package 
    User.register({username: req.body.username}, req.body.password, function( err, user){
        if( err ){
            console.log( err ); 
            res.redirect("/register"); 
        }
        //else {
        // if no errors we will authenticate our user using passport 
        // we are using 'local' strategy 
        passport.authenticate("local")(req, res, function(){

           // console.log( req.user.role); 
            // we authenticated them, so let them see the '/' which has the dashboard 

            // before we redirect need to assign them a role 
            const updatedRole = { role: 'user'}; // assigning default role = 'user'

            // update user's new role 
            User.updateOne({_id: req.user._id}, updatedRole, function(err){ // start updateOne()
                if(!err){
                    console.log("user's role is assigned ! "); 
                }

                    // if role = user // send to user route 

                    // if role = 
            });  // end updateOne()

          
                  // if role = user // send to user route 

                    // if role = admin 
            // redirect to somewhere any body can access, the 'create form' will be in this route// or replaced by it in the future 
            res.redirect("/userDashboard");  // role==user will always go to this route
        })
    }); 

}); 

// let users log in 
app.post('/login' , function( req, res){

    // create user 
    const user = new User({
        username: req.body.username,
        password: req.body.password, 
    }); 

    // log in the user with passport 

    req.login( user , function(err){
        if(err){
            console.log(err);
        }

        // create and send a cookie to browser to let it know user are logged in 
        passport.authenticate("local")(req, res, function(){

          
            // they are allowed to see dashboard 

            // check if they have role 
                User.find({_id: req.user._id}, function(err, foundUser ){ // start find()
                   
                    // check if User has a role 
                    if(foundUser[0].role === undefined ){
                        //they do not have a role, need to update that 

                        // by default every user will have a 'user' role / owner > admin > user 
                        const updatedRole = { role: 'user'}; 

                        // update user's new role 
                        User.updateOne({_id: foundUser[0]._id}, updatedRole, function(err){ // start updateOne()
                            if(!err){
                                console.log("user's role is updated! "); 
                            }
                        });  // end updateOne()
                    }
                    else {
                            if(foundUser[0].role === 'owner' ){
                                res.redirect("/ownerDashboard");
                            }
                            else if (foundUser[0].role === 'admin'){
                               res.redirect("/adminDashboard");
                            }
                            else{
                                res.redirect("/userDashboard");
                            }
                    }

                }); // end find()
               
            // redirect to somewhere any body can access, the 'create form' will be in this route// or replaced by it in the future 
           // res.redirect("/newUser"); 
        })
    })
}); 
app.get("/userDashboard", function(req, res){
    const UserID=req.user._id;
    console.log(UserID);
    Ticket.find({userID:UserID}, function(err, foundTickets){
        if(!err){
            res.render('viewTickets', {tickets : foundTickets});
         }
    });
});
app.get("/adminDashboard" , function( req, res){
   
    Ticket.find({}, function(err, result){
        if(!err){
            res.render('viewTickets', {tickets : result});
         }
    });
});


app.get("/ownerDashboard" , function( req, res){
    const filter = req.query.filter; 
  
    if( filter === 'urgency'){
       
        Ticket.find().sort({urgency: 1}).exec(function( err, sortedTickets){
            if(!err){
                res.render('viewTickets', {tickets : sortedTickets});
            }
        })
    }
    else if( filter === 'date'){
        Ticket.find().sort({created_at: 1}).exec(function( err, sortedTickets){
            if(!err){
                res.render('viewTickets', {tickets : sortedTickets});
            }
        }) 
    }
    else if( filter === 'status'){
        Ticket.find().sort({status: -1}).exec(function( err, sortedTickets){
            if(!err){
                res.render('viewTickets', {tickets : sortedTickets});
            }
        }) 
    }
    
    else{

    
    Ticket.find({}, function(err, result){
        if(!err){
            res.render('viewTickets', {tickets : result});
         }
    });
    }
});


app.post('/filterTickets', function(req,res){
    //query = req.body.filter; 
    const filter = req.body.option; 
   
    res.redirect('/ownerDashboard/?filter='+filter); 
  
})

 

app.post("/delete", function(require, response){


        const UserToDelete = require.body.deleteUser; 

        console.log( " delete this user: " + UserToDelete);
        
        Sample.deleteOne( {_id: UserToDelete}, function(err){
            if( !err){

                console.log( " item deleted successfully ")
                res.redirect("/"); 

            }
            else {
                console.log( err); 
            }
        })
}); 

app.get('/logout', function( req, res){
    req.logout();

    // log out and take to log in / register page 
    res.redirect('/home');
});

//loggedIn,  uOwner, 
app.get('/ManageUsers',   function( req, res){

    console.log(query +  " ==== " + null); 
    if( query === null || query === undefined || query === 'all'){

        
        User.find({}, function( err, foundUsers){
            //console.log(foundUsers); 
            res.render('manageUsers',{ ListOfUsers: foundUsers}); 


    }); 
            //res.redirect('/ManageUsers');
    }
    else if(query === 'az'){
        
            User.find().sort({username:1}).exec(function( err, foundUserInRole){
                if( !err ){
                    res.render('manageUsers',{ ListOfUsers: foundUserInRole}); 
                }
            });
    }
    else {
        User.find({role: query}, function(err, foundUserInRole){
                        if(!err){
                            res.render('manageUsers',{ ListOfUsers: foundUserInRole});
                        }
                    }); 
    }
    //res.redirect('/ManageUsers'); 
}); 

//loggedIn,  uOwner, 
app.post('/ManageUsers',  function( req, res){


    
    const scrambleIdRole= req.body.selectROLE; 

    // scrambleIdRole has id and role in one, i need to separate it 

    var index = scrambleIdRole.indexOf("$");  // Gets the first index where a '$' 
    var userID = scrambleIdRole.substr(0, index); // Gets the first part _id
    var ROLE = scrambleIdRole.substr(index + 1);  // Gets role 

    if( ROLE === 'DELETE'){
        User.deleteOne({_id: userID}, function(err){
            if( !err){
                console.log(" successfully deleted user "); 
            }
            res.redirect('/ManageUsers'); 
        }); 
    }
    else{

        const updatedRole = { role: ROLE}; 

        User.updateOne({_id: userID}, updatedRole, function(err){
            if(!err){
                console.log("new role updated"); 
            }
            res.redirect('/ManageUsers'); 
    });
    }
    // res.redirect('/ManageUsers'); 

    


}); 


app.post('/filterUsers', function(req,res){
     query = req.body.filter; 
     
     res.redirect('/ManageUsers'); 
   
})

app.get("/createTicket" , function( req, response){

    response.render('createTicket'); 
})
//Create ticket 
app.post('/createTicket', function(req, response){
    const UserID = req.user._id;
    const ticketTitle = req.body.newTitle;
    const ticketDes = req.body.newDes;
    const ticketUrgency = req.body.newUrg;
    //Created by
    const ticketCreatedBy = req.body.newCreatedBy;
    const ticketContact = req.body.newContact;
    const ticketStatus= req.body.newStatus;

    const newTicket = { title: ticketTitle ,  description : ticketDes, urgency: ticketUrgency, createdBy: ticketCreatedBy,userID: UserID, contact: ticketContact, status:ticketStatus}; 


    if( ticketTitle != undefined && ticketDes != undefined){
        Ticket.insertMany(newTicket); 

        response.redirect("/userDashboard"); 
    }
    else {
        console.log( " title: " + ticketTitle); 
        console.log( " description : " + ticketDes); 
    }
});
//Display Tickets
app.get("/viewTickets", function(req, res){ 
    Ticket.find({}, function(err, result){
        if(!err){
            res.render('viewTickets', {tickets : result});
         }
    });
});


app.listen(3000, function(){
    console.log("Server started on port 3000");
   
});

