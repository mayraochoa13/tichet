//jshint esversion:6


const { response } = require("express");
const express = require("express");

const app = express();

const mongoose  = require("mongoose");
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
const Sample = require('./models/ticket.js'); 
// connect mongoose database 
// mongoose.connect("mongodb://localhost:27017/TicketsDB" , {useNewUrlParser: true , useUnifiedTopology: true}); 


mongoose.connect("mongodb+srv://adminSaul:test123@cluster0.pyekv.mongodb.net/SampleDB?retryWrites=true&w=majority" , {useNewUrlParser: true , useUnifiedTopology: true}); 

// i attempted to create a new model/schema outside in the ./model but i need to work with passport 
// so i will figure out how to move this user model/schema to ./model later 

const userSchema = new mongoose.Schema( { 
    email:  String, 
    password: String 
});

// add passport local mongoose as a plug in for userSchema 
userSchema.plugin(passportLocalMongoose); 

const User = new mongoose.model("User", userSchema); 

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


// display users 
app.get("/test", function(req, res){ 
    User.find({}, function(err, result){
        if(!err){
            res.render('manage_users', {users : result});
         }
         console.log(result);
    });
});

app.get("/", function(req, res){
    // this is the route we want to make sure user is authenticated 

    if( req.isAuthenticated()){ // check authentication 
        // 1) filters by name
        // 2) filters by age
        // 3) undo the work
        Sample.find({}, function( err, foundUsers){
            // found all the documents and stored them on found users 
                if( ! err){
                    res.render('dashboard', { dataList : foundUsers}); 
                    console.log(foundUsers);
                }
            });
        // switch(filterVal){
        //     case "1":
        //         Sample.find().sort({name:1}).exec(function( err, sortedUsers){
        //             if( !err ){
        //                 res.render('dashboard' , { dataList : sortedUsers }); 
        //             }
        //         });
        //         break;
        //     case "2":
        //         Sample.find().sort({age:1}).exec(function( err, sortedUsersByAge){

        //             if( !err ){
        //                 res.render('dashboard' , { dataList : sortedUsersByAge }); 
        //             }
        //         });
        //         break;   
        //     default: 
        //         Sample.find({}, function( err, foundUsers){
        //         // found all the documents and stored them on found users 
        //             if( ! err){
        //                 res.render('dashboard', { dataList : foundUsers}); 
        //             }
        //         }); 
        //         break;
        // }
    }// end authentication if statement 
    else{
        // they are not authenticated, send them to log in 
        res.redirect('/home'); 
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
            // we authenticated them, so let them see the '/' which has the dashboard 
            res.redirect("/"); 
        })
    }); 

}); 

// let users log in 
app.post('/login' , function( req, res){

    // create user 
    const user = new User({
        username: req.body.username,
        password: req.body.password
    }); 

    // log in the user with passport 

    req.login( user , function(err){
        if(err){
            console.log(err);
        }

        // create and send a cookie to browser to let it know user are logged in 
        passport.authenticate("local")(req, res, function(){
            // they are allowed to see dashboard 
            res.redirect('/'); 
        })
    })
}); 



app.get("/newUser" , function( require, response){

    response.render('newUserForm'); 
})


app.post("/newUser" , function( require, response){
    
    const userName = require.body.newName;
    const userAge = require.body.newAge;
    // console.log(userName[3])

    const newUser = { name: userName ,  age : userAge}; 


    if( userName != undefined && userAge != undefined){
        Sample.insertMany(newUser); 

        response.redirect("/"); 
    }
    else {
        console.log( " name is : " + userName); 
        console.log( " age is : " + userAge); 
    }
   
}) 

app.post("/delete", function(require, response){


        const UserToDelete = require.body.deleteUser; 

        console.log( " delete this user: " + UserToDelete);
        
        Sample.deleteOne( {_id: UserToDelete}, function(err){
            if( !err){

                console.log( " item deleted successfully ")
                response.redirect("/"); 

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

app.listen(3000, function(){
    console.log("Server started on port 3000");
    
});
app.get("/createTicket" , function( require, response){

    response.render('createTicket'); 
})
app.post('/createTicket', function(require, response){

    const ticketTitle = require.body.newTitle;
    const ticketDes = require.body.newDes;
    const ticketUrgency = require.body.newUrg;
    const ticketCreatedBy = require.body.newCreatedBy;
    const ticketContact = require.body.newContact;
    const ticketStatus= require.body.newStatus;

    const newTicket = { title: ticketTitle ,  description : ticketDes, urgency: ticketUrgency, createdBy: ticketCreatedBy, contact: ticketContact, status:ticketStatus}; 


    if( ticketTitle != undefined && ticketDes != undefined){
        Sample.insertMany(newTicket); 

        response.redirect("/"); 
    }
    else {
        console.log( " title: " + ticketTitle); 
        console.log( " description : " + ticketDes); 
    }
});
//Display Tickets
app.get("/viewTickets", function(req, res){ 
    Sample.find({}, function(err, result){
        if(!err){
            res.render('viewTickets', {tickets : result});
         }
    });
});

// npm install mongoose
// errors 
    // npm i mongoose express ejs 

// next steps 
// 1) import database schema + model (x)
// 2) connect it to Mongodb Atlas 
// 3) create the from/ticket 
//      - route "/newTicket"
//     - get the user input using ejs, body-parser 
//     -  finish the route , we have the data now we just need to insert to db
// 3.5 User Authentication  
// 4) creat dashboard with ticket summary data <input name= "status"
// == from users can submit , a dashboard one can see a list of submissions 
//        4 a) query and find all the tickets made 
//          b) display 
//          c) query for specific tickets and find them and display them 
// 
// CRUD = > create , read , update , delete 


// if " cannot find x_dependency  " { npm i x_dependency }