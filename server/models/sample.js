const mongoose = require("mongoose");

const sampleSchema = new mongoose.Schema({

    name :{
        type: String ,
        required: true, 
    },
    age:{
        type: String , 
        required: true,
    }

}); 

const Sample = mongoose.model("samples", sampleSchema); 

module.exports = Sample; 

