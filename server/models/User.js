// hold user account database model 

// using passport-local-mongoose


const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose'); 

const userSchema= new mongoose.Schema( { 
    email:  String, 
    password: String, 
    role: String, 
    FirstName: String, 
    LastName: String, 
});

// add passport local mongoose as a plug in for userSchema 
userSchema.plugin(passportLocalMongoose); 

const User = new mongoose.model("User", userSchema); 

module.exports = User; 


