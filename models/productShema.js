const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    title:{
        type:String,
        required:true,
    },
    desc:{
        type:String,
        required:true,
    },
    images:[
        {
            url:{
                type: String,

            }
        }
    ],
    category:{
        type:Schema.Types.ObjectId,
        ref:'Category',
    },
    size:{
        type:String,
    },
   color:{
        type:String,  
    },
    price:{
        type:Number,
        required:true
    },
    offerGot:{
        type:Number,
    },
    realPrice:{
        type:Number,
        default: 0
    },
    stock: {
        type: Number,
        required: true,
        min:0,
        max:255
    },
    productOffer:{
        type: Number,
        default: 0
    },
dateCreated:{
       type:Date,
        default:Date.now
},
deleted:{
    type:Boolean,
    default:false
},
discount_percentage: { 
    type: Number, 
    default: 0 
},
start_date: {
     type: Date 
    },
end_date: { 
    type:
     Date
     },

});

module.exports.Product = mongoose.model('Product',productSchema)