const mongoose = require('mongoose');


const cartSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    items:[{
        product:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'Product',
            required:true
        },
        quantity:{
            type:Number,
            required: true,
            default:1
        },
        subtotal:{
            type:Number,
        }
    }],
    totalPrice:{
        type:Number
    }
},
{ timestamps: true }
);

module.exports.Cart = mongoose.model("Cart", cartSchema)