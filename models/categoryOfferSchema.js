const mongoose = require('mongoose');
const schema = mongoose.Schema; 


const categoryOfferSchema = new schema({

    offerPercentage: {
       type: Number,
       required: true
    },
    category:{
        type:  schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        unique: true
    }
});


module.exports.CategoryOffer = mongoose.model('CategoryOffer', categoryOfferSchema);