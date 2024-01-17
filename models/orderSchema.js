const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const orderSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'User'
    },
    items: [
        {
        name: {    
            type: String,
            required: true
        },
        price: {
            type: String,
            required: true
        },
        offerprice:{
            type: Number,
            default: 0.00
        },
        prodId: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
    }
    ],
    address:  {
            firstName: String,
            lastName: String,
            landmark: String,
            addressDetail: String,
            state: String,
            zip: Number,
            phone: Number
        }
    ,
    totalPrice:{
       type: String
    },
    totalPaid: {
       type: String
    },
    
    paymentStatus: {
        type: String
    },
    paymentMethod: {
        type: String
    },
    deliveryStatus:{
        type: String,
        default: 'pending'
    },
    orderStatus:{
        type: String,
        default: 'pending'
        
    },
    canceled: {
        type: Boolean,
        default: false
    },
    returnRequest: {
        type: Boolean,
        default: false
    },
    returned: {
        type: Boolean,
        default: false
    },
    returnApprovel:{
      type: Boolean,
      default: false
    },
    deliveredAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports.Orders = mongoose.model('Order', orderSchema);
