const mongoose = require('mongoose');
const Schema =  mongoose.Schema;



const addressSchema = Schema({
  userId: {
    type: String,
    required: true
  },
 addresses:[{ 
    firstName: {
    type: String,
    required:true
  },
  lastName: {
    type: String,
    requires:true
  },
  landmark: {
    type: String,
  },
  addressDetail: {
    type: String,
    requires:true
  },
  state: {
    type: String,
    requires:true
  },
  zip: {
    type: Number,
    requires:true
  },
  phone: {
    type: Number,
    requires:true
  },
}]
});

module.exports.Address = mongoose.model("Address", addressSchema);