


function authRole( role ){

 
    return( req, res, next)=>{

       // console.log( req.role ); 
        if( req.role !== role){

            
            res.status(401); 
            return res.send("not allowed")
        }
        next()
    }
}

module.exports={
    authRole
}