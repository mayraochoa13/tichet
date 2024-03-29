//jshint esversion:6
const { response } = require("express");
const express = require("express");
const path = require('path'); 
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

// use ejs  //app.set('views', path.join(__dirname, 'views'));
app.set('view engine' , 'ejs');
app.set('views', path.join(__dirname, 'views'));

// use body parser 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended:true }));

// connecting css to the server
//const path = require('path')
// app.use('/static', express.static(path.join(__dirname, '/public')))
// app.use("/public", express.static(__dirname + "/public")); <-- this one also works
app.use(express.static(__dirname + '/public'));


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


//mongoose.connect("mongodb+srv://adminSaul:test123@cluster0.pyekv.mongodb.net/SampleDB?retryWrites=true&w=majority" , {useNewUrlParser: true , useUnifiedTopology: true}); 

mongoose.connect("mongodb+srv://techsquad:dnest-Tech22@tichetcluster.gcojx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority" , {useNewUrlParser: true , useUnifiedTopology: true});
// passport local configurations 
passport.use(User.createStrategy()); 

// serialise creates a cookie 
passport.serializeUser(User.serializeUser()); 

// decode cookie message 
passport.deserializeUser(User.deserializeUser());

//app.get("/", function(req, res){
app.get("/",  function(req, res){

    res.render("login"); 
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

            // before we redirect need to assign them a role 
            const first_name= req.body.first_name; 
            const last_name= req.body.last_name;
            const updatedUserDetails = {FirstName: first_name, LastName: last_name, role: 'user'}; // assigning default role = 'user'

            // update user's new role 
            User.updateOne({_id: req.user._id}, updatedUserDetails , function(err){ // start updateOne()
                if(!err){
                    console.log("user registered ! "); 
                }

            });  // end updateOne()

            let newRole = 'user'
            // redirect to somewhere any body can access, the 'create form' will be in this route// or replaced by it in the future 
            res.redirect("/userDashboard/?role="+newRole);  // role==user will always go to this route
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
            //console.log(err);
            //res.redirect('/login'); 
        }
        else{

        // create and send a cookie to browser to let it know user are logged in 
        passport.authenticate("local", { failureRedirect: '/login', failureMessage: true })(req, res, function(){

          
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
                                // staffDashboard
                                res.redirect("/staffDashboard/?role="+foundUser[0].role);
                            }
                            else if (foundUser[0].role === 'admin'){
                               res.redirect("/staffDashboard/?role="+foundUser[0].role);
                            }
                            else{
                                res.redirect("/userDashboard/?role="+foundUser[0].role);
                            }
                    }

                }); // end find()
           
        })
        }// else 
    })
}); 
app.get("/userDashboard",loggedIn, function(req, res){
    
    //http://localhost:3000/userDashboard/?=filter=urgency
    const UserID=req.user._id;
    //const UserID=req.query.userID;
    const role = req.query.role; 
    
    let filter = req.query.filter; 
   
    
   let strID = JSON.stringify(UserID);
    //console.log(strID.length );
    strID = strID.substr(1);
    strID = strID.substring(0, strID.length - 1);

    if( filter === 'urgency'){
       
        Ticket.find({userID:strID}).sort({urgency: 1}).exec(function( err, sortedTickets){
            if(!err){
                res.render('viewTickets', {tickets : sortedTickets, user: strID, role: role});
            }
        })
    }
    else if( filter === 'date'){
        Ticket.find({userID:strID}).sort({created_at: 1}).exec(function( err, sortedTickets){
            if(!err){
                res.render('viewTickets', {tickets : sortedTickets, user: UserID, role: role});
            }
        }) 
    }
    else if( filter === 'status'){
        Ticket.find({userID:strID}).sort({status: -1}).exec(function( err, sortedTickets){
            if(!err){
                res.render('viewTickets', {tickets : sortedTickets, user: UserID, role: role});
            }
        }) 
    }
    
    else{

        Ticket.find({userID:strID}, function(err, foundTickets){
            if(!err){
                res.render('viewTickets', {tickets : foundTickets , user: UserID, role: role});
        }
    });
    }
});

app.get("/staffDashboard" ,loggedIn, uAdminOrOwner, function( req, res){
    const filter = req.query.filter;
    const role = req.query.role;  
    const UserID =req.user._id;
    if( filter === 'urgency'){
       
        Ticket.find().sort({urgency: 1}).exec(function( err, sortedTickets){
            if(!err){
                res.render('viewTickets', {tickets : sortedTickets, user: UserID, role: role});
            }
        })
    }
    else if( filter === 'date'){
        Ticket.find().sort({created_at: 1}).exec(function( err, sortedTickets){
            if(!err){
                res.render('viewTickets', {tickets : sortedTickets, user: UserID,role: role});
            }
        }) 
    }
    else if( filter === 'status'){
        Ticket.find().sort({status: -1}).exec(function( err, sortedTickets){
            if(!err){
                res.render('viewTickets', {tickets : sortedTickets, user: UserID,role: role});
            }
        }) 
    }
    
    else{

    // lets try and render date
    Ticket.find({}, function(err, result){
        if(!err){
            res.render('viewTickets', {tickets : result, user: UserID, role: role});
         }
    });
    }
});


app.post('/filterTickets', function(req,res){
    //query = req.body.filter; 
    const filterAndUser = req.body.option; 
   

    var index = filterAndUser.indexOf("$");  // Gets the first index where a '$' 
    var filter= filterAndUser.substr(0, index); // Gets the first part _id
    var userID = filterAndUser.substr(index + 1);  // Gets role 
 

   // search up the role of the user based on the id 
   User.find({_id:userID}, function(err, foundUser){

    if(!err){
      

        if( foundUser[0].role === 'owner' || foundUser[0].role === 'admin'){
            res.redirect('/staffDashboard/?filter='+filter+'&role='+foundUser[0].role); 
        }
        else{
            res.redirect('/userDashboard/?filter='+filter+'&role='+foundUser[0].role);
        }

    }
    else{ console.log(err) }

   });
 
  
})

 


app.get('/logout', function( req, res){
    req.logout();

    // log out and take to log in / welcome page 
    res.redirect('/');
});

//loggedIn,  uOwner, 
app.get('/ManageUsers',loggedIn,  uOwner, function( req, res){
    const query = req.query.filter; 

    if(  query === undefined || query === 'all'){
        
        UserController.getAllUsers(req , res, 'manageUsers');
    }
    else if(query === 'first'){
        // attempting to order users without case sensitivity, sort orders A first over a
            User.find().collation({locale: "en"}).sort({FirstName:1}).exec(function( err, foundUserInRole){
                if( !err ){
                    res.render('manageUsers',{ ListOfUsers: foundUserInRole}); 
                }
            });
    }
    else if(query === 'last'){
        // attempting to order users without case sensitivity, sort orders A first over a
            User.find().collation({locale: "en"}).sort({LastName:1}).exec(function( err, foundUserInRole){
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
                Ticket.deleteMany({userID: userID}, function(err){
                    if( !err){
                        console.log(" successfully deleted user's tickets "); 
                    }
                })
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
    const UserFilter = req.body.filter; 
     
     res.redirect('/ManageUsers/?filter='+UserFilter); 
   
})

app.get("/createTicket" , loggedIn,  function( req, response){

    response.render('createTicket'); 
})
//Create ticket 
app.post('/createTicket',loggedIn, function(req, response){
    const UserID = req.user._id;
    const ticketTitle = req.body.newTitle;
    const ticketDes = req.body.newDes;
    const ticketUrgency = req.body.newUrg;
    console.log(ticketUrgency)
    //Created by
    const ticketCreatedBy = req.body.newCreatedBy;
    const ticketContact = req.body.newContact;
    // when a user creates a ticket they themselves can add a status
   // const ticketStatus= req.body.newStatus;
   const ticketStatus='submitted'; 

    const newTicket = { title: ticketTitle ,  description : ticketDes, urgency: ticketUrgency, createdBy: ticketCreatedBy,userID: UserID, contact: ticketContact, status:ticketStatus}; 

        Ticket.insertMany(newTicket); 
        // insert ticket now redirect to dashboard 

        const CurrentRole= 'user';
        response.redirect("/userDashboard/?role="+CurrentRole); 
  
});
//Display Tickets
app.get("/viewTickets", loggedIn,  function(req, res){ 
    // need to know who is viewing the tickets to know their role 
    Ticket.find({}, function(err, result){
        if(!err){
            res.render('viewTickets', {tickets : result });
         }
    });
});

app.get('/TicketSummary',loggedIn,  function(req, res){
    const ticketId = req.query.ticketID; 
    const role = req.query.role; 

    Ticket.find({_id: ticketId}, function(err, foundTicket){
        if(!err){
            // render found ticket, summary page 
            res.render('TicketSummary',{tickets : foundTicket , role: role}); 
        }
    })
    
}); 

app.post('/TicketSummary', function(req, res){
    const ticketIdAndRole = req.body.summary; 
  
    // need to split the string to get ticketID and role 
    var index = ticketIdAndRole.indexOf("$");  // Gets the first index where a '$' 
    var ticketId= ticketIdAndRole.substr(0, index); // Gets the first part _id
    var role = ticketIdAndRole.substr(index + 1);  // Gets role 
    res.redirect('/TicketSummary/?ticketID='+ticketId+'&role='+role); 

}); 

app.get('/return',  loggedIn,  function(req, res){
    const role = req.query.role; 

      if( role === 'user'){
        res.redirect('/userDashboard/?role='+role); 
    }else { // else they are an admin or owner either way will go to same route 
        res.redirect('/staffDashboard/?role='+role); 
    }
}); 

app.post('/return',   function(req, res){
    
        res.redirect('/return/?role='+req.body.returnBtn); 
   
}); 

// update ticket status 
app.post('/updateTicket', function( req, res){

    let ticketIdAndStatus = req.body.statusUpdate; 

    let substringValues= ticketIdAndStatus.split('$'); 
  
    // console.log(substringValues[0]);// ticket id 
    // console.log(substringValues[1]);// role of the user requesting to update 
    // console.log(substringValues[2]);// what value the ticket status needs to be updated too 
    res.redirect('/updateTicket/?ticketID='+substringValues[0]+'&role='+substringValues[1]+'&status='+substringValues[2]); 
}); 

app.get('/updateTicket', loggedIn,  function( req, res){
 
        const ticketID= req.query.ticketID;
        const Role= req.query.role;
        const NewStatus = req.query.status; 

        if( NewStatus != 'DELETE'){
         
        const updatedStatus = { status: NewStatus}
                Ticket.updateOne({_id: ticketID}, updatedStatus, function(err){
                    if(!err){
                        console.log("Ticket Status updated !");
                              // render Ticket Summary
                        Ticket.find({_id: ticketID}, function(err, foundTicket){
                            if(!err){
                    
                            res.render('TicketSummary',{tickets : foundTicket , role:Role});
                                
                            }
                        });
                    }
                    else{ console.log(err)}
                }); 
                //     // render Ticket Summary
                // Ticket.find({_id: ticketID}, function(err, foundTicket){
                //     if(!err){
               
                //       res.render('TicketSummary',{tickets : foundTicket , role:Role});
                        
                //     }
                // });

        }
        else {
            // delete ticket and render to dashboard and not ticketSummary 
            Ticket.deleteOne({_id: ticketID}, function(err){
                if( !err){
                            console.log( " ticket deleted successfully ")
                           // res.render('TicketSummary',{tickets : foundTicket , role:Role});
                           res.redirect('/staffDashboard/?role='+Role); 
            
                        }
                        else {
                            console.log( err); 
                        }
            })
        }

       

}); 

app.post('/editTicket' , function(req, res){
    let ticketIdAndRole = req.body.IDandROLE; 
    var index = ticketIdAndRole.indexOf("$");  // Gets the first index where a '$' 
    var ticketId= ticketIdAndRole.substr(0, index); // Gets the first part _id
    var role = ticketIdAndRole.substr(index + 1); 

    res.redirect('/editTicket/?ticketID='+ticketId+'&role='+role); 
    
}); 

app.get('/editTicket', loggedIn  ,function(req, res){
 
    var ticketId= req.query.ticketID
    var role = req.query.role; 
    var edit = req.query.menuOption; 

   
    
   Ticket.find({_id: ticketId}, function(err, foundTicket){
        try{
            res.render('editTicket', {tickets : foundTicket, role : role , editOption: edit}); 
        }
        catch(err){
            console.log(err);
        }
          
      
   });
}); 

app.post('/editMenu', function(req,res){

    let EditMenuOptions = []; 
    EditMenuOptions.push(req.body.title); 
    EditMenuOptions.push(req.body.description); 
    EditMenuOptions.push(req.body.createdBy); 
    EditMenuOptions.push(req.body.contact); 
   
    for( var i = 0; i < EditMenuOptions.length ; i++){
        if(EditMenuOptions[i] != undefined){
             
           // split string into 2 parts 
           var index = EditMenuOptions[i].indexOf("$");
           var ticketId= EditMenuOptions[i].substr(0, index); // Gets the first part _id
           var option = EditMenuOptions[i].substr(index + 1);  // Gets menu option  
           res.redirect('/editTicket/?ticketID='+ticketId+'&role=user'+'&menuOption='+option); 
            //res.redirect('/editTicket/?menuOption='+EditMenuOptions[i]); 
        }
    }
    
  
    
}); 


app.post('/updateTitle', function(req, res){
    const ticketID = req.query.ticketID; 
    const NewTitle = req.body.UptdTitle;
    
    let update = { title: NewTitle }; 
    Ticket.updateOne({_id: ticketID}, update,function(err){
        if(!err){
            console.log('title updated successfully'); 

        }
    }); 
    // re render edit ticket page but with updated title value and closed edit menu options 
    res.redirect('/editTicket/?ticketID='+ticketID+'&role=user'); 
}); 

app.post('/updateDescription', function(req, res){
    const ticketID = req.query.ticketID; 
    const NewDescription = req.body.UptdDescription;
    
    let update = { description: NewDescription }; 
    Ticket.updateOne({_id: ticketID}, update,function(err){
        if(!err){
            console.log('description updated successfully'); 

        }
    }); 
    // re render edit ticket page but with updated title value and closed edit menu options 
    res.redirect('/editTicket/?ticketID='+ticketID+'&role=user'); 
});

app.post('/updateUrgency', function(req, res){
    const ticketID = req.query.ticketID; 
    //req.body.urgencyUpdate;

    // console.log(req.body.urgencyUpdate)
    
    let update = { urgency: req.body.urgencyUpdate }; 
    Ticket.updateOne({_id: ticketID}, update,function(err){
        if(!err){
            console.log('urgency updated successfully'); 

        }
    }); 
    // re render edit ticket page but with updated title value and closed edit menu options 
    res.redirect('/editTicket/?ticketID='+ticketID+'&role=user'); 
});

app.post('/updateCreatedBy', function(req, res){
    const ticketID = req.query.ticketID; 
    const NewCreatedBy = req.body.UptdCreatedBy;
    
    let update = { createdBy: NewCreatedBy }; 
    Ticket.updateOne({_id: ticketID}, update,function(err){
        if(!err){
            console.log('created by updated successfully'); 

        }
    }); 
    // re render edit ticket page but with updated title value and closed edit menu options 
    res.redirect('/editTicket/?ticketID='+ticketID+'&role=user'); 
});

app.post('/updateContact', function(req, res){
    const ticketID = req.query.ticketID; 
    const NewContact = req.body.UptdContact;
    
    let update = { contact: NewContact }; 
    Ticket.updateOne({_id: ticketID}, update,function(err){
        if(!err){
            console.log('contact updated successfully'); 

        }
    }); 
    // re render edit ticket page but with updated title value and closed edit menu options 
    res.redirect('/editTicket/?ticketID='+ticketID+'&role=user'); 
});

app.post('/updateDelete', function(req, res){
    const ticketID = req.body.deleteBTN; 

    Ticket.deleteOne({_id:ticketID}, function(err){
        if(!err){
            console.log('user successfully deleted ticket'); 

            // need to send them back to userDashboard 
            res.redirect('/userDashboard/?role=user'); 
        }   
     }); 
}); 
let port = process.env.PORT;
if(port==null||port == ""){
    port = 3000;
}
app.listen(port, function(){
    console.log("Server has started successfully");
   
});

const UserController = require("./controllers/userController");

