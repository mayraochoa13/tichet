const userModel = function() {

    var getUsers = function() {
        return new Promise((resolve, reject) => {
          User.find({}, function(err, foundUsers) {
            if (err) {
              return reject(err)
            }
            return resolve(foundUsers)
          })
        })
      }
      

    return {
        getUsers, 
    }
}

module.exports = userModel();

const User = require("./User");
