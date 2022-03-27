


function authRole( role ){

 
    return( req, res, next)=>{

       // console.log( req.role ); 
        if( req.role !== role){

            
            res.status(401); 
            return res.send("not allowed")
        }
        next()
    }
}; 

// Middleware to check if user is logged in 
function loggedIn(req, res, next) {

    if (req.user) {
        next();
    } else {
        res.redirect('/login');
    }
}; 

// Middleware to check user's role 
function uAdminOrOwner(req, res, next){
    // both can access, no 'user' allowed 
    if( req.user === undefined){
            res.redirect('/login')
    }
    else if( req.user.role === 'admin' || req.user.role === 'owner' ){
        next(); 
    }
    else {
        res.redirect('/login');
    }
}; 

function uOwner (req, res, next){
    // only owner can access, no 'admin' or 'user' 
    if( req.user === undefined){
        res.redirect('/login')
    }
    else if( req.user.role === 'owner'){
        next(); 
    }
    else {
        res.redirect('/login');
    }
}; 

module.exports={
    authRole,
    loggedIn,
    uAdminOrOwner,
    uOwner
}; 