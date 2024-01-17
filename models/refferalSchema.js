const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema({
  referringUserId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" },
  referredUsersId: [
    {
      
        id: {
          type: String
      },
      createdAt: { 
        type: Date, 
        default: Date.now 
      }
    }
  ],
  status: { 
    type: Boolean,
    default: true
  },
    usedUsers:{
   type: Number,
   default: 0
    }
});

const Referral = mongoose.model("Referral", referralSchema);

module.exports = Referral;
