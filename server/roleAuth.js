



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
    loggedIn,
    uAdminOrOwner,
    uOwner
}; 