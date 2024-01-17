const mongoose = require('mongoose');



const userSchema = new mongoose.Schema({
    username:{
        type:String,
         required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone: {
        type: Number,
        requires:true
      },
    password:{
        type:String,
        required:true
    },
    otp:{
        type:String,
    },
    blocked:{
        type:Boolean,
        default:false
    },
    image: {
       type: String,
       default: 'User Profile'
    },
    verify: {
        type: Boolean,
        default: false
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    refferalCode:{
        type:String,
        unique: true

    },
    refferalLink:{
        type: String,
        unique: true
    }
},);

module.exports.User = mongoose.model("User",userSchema)