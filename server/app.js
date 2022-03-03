//jshint esversion:6


const { response } = require("express");
const express = require("express");

const app = express();

const mongoose  = require("mongoose");

// import database schema 
//import Ticket from "./models/ticket"; 

// import model 
const Sample = require('./models/sample'); 
// connect mongoose database 
// mongoose.connect("mongodb://localhost:27017/TicketsDB" , {useNewUrlParser: true , useUnifiedTopology: true}); 



mongoose.connect("mongodb+srv://adminSaul:test123@cluster0.pyekv.mongodb.net/SampleDB?retryWrites=true&w=majority" , {useNewUrlParser: true , useUnifiedTopology: true}); 

//let samp01 = { name: 'saul' , age: '24'}; 
//Sample.insertMany(samp01);



app.get("/", function(require, response){
    response.send("hello world ");
})

//app.post () 

app.listen(3000, function(){
    console.log("Server started on port 3000");
    
});

// npm install mongoose


// next steps 
// 1) import database schema + model (x)
// 2) connect it to Mongodb Atlas 
// 3) create the from/ticket 
//      - route "/newTicket"
//     - get the user input using ejs, body-parser 
//     -  finish the route , we have the data now we just need to insert to db 
// 4) creat dashboard with ticket summary data <input name= "status"
// == from users can submit , a dashboard one can see a list of submissions 
//        4 a) query and find all the tickets made 
//          b) display 
//          c) query for specific tickets and find them and display them 
// 
// CRUD = > create , read , update , delete 