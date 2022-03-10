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
},
// passing as an option in the constructor  
    {
    timestamps: true,
    }
); 

const Sample = mongoose.model("samples", sampleSchema); 

module.exports = Sample; 

