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

// test to see if i have access to github outside of 2n, using vs code
const User = require("./User");
