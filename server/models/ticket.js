

const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({

    title:{
        type: String , 
        required: true, 
    },
    description:{
        type: String, 
        required: true,
    },
    // images:{
    //     data: Buffer,
    //     contentType: String,
    //     required: false, 
    // },
    urgency:{
        type: String , 
        required: true,
    }, 
    createdBy:{
        type: String, 
        required: true, 
    },
    userID:{
        type: String, 
        required: true, 
    },
    contact:{
        type: String, 
        required: true,
    }, 
    status:{
        type: String, 
        required: true , 
    }
}, {timestamps: true }); 

const Ticket = mongoose.model("Ticket", TicketSchema); 

module.exports = Ticket; 

