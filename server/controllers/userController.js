const userController = function () {

    var getAllUsers = function(req, res , view){
        
        UserModel.getUsers()
        .then(users => res.render(view,{ ListOfUsers: users}))
        .catch(err => res.status(500).send({ error: 'Failed to retrieve users' }))
    
    }
    
    return{
       getAllUsers, 
    } 
}

module.exports = userController(); 

const UserModel = require("../models/userModel");
