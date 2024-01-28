const { Category } = require("../models/CategorySchema");
const { Coupon } = require("../models/couponSchema");
var couponCode = require("coupon-code");


// Function to get categories
const getCategory = async function () {
    try {
      const categories = await Category.find({active: true});
      if (categories.length > 0) {
        return categories;
      } else {
        throw new Error("Couldn't find categories");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

// Find and update coupons that have expired
const checkAndUpdateExpiredCoupons = async () => {
    try {
        const currentDate = new Date();
        const coupons = await Coupon.find({ expirationDate: { $lte: currentDate }, expired: false });

        if (coupons.length > 0) {
            const expiredCoupons = await Coupon.updateMany(
                { _id: { $in: coupons.map(coupon => coupon._id) } },
                { $set: { expired: true } }
            );

            if (expiredCoupons) {
                console.log("Coupons expired:", expiredCoupons.nModified);
            }
        } else {
            console.log("No coupons found that have expired.");
        }
    } catch (error) {
        console.error("Error checking and updating expired coupons:", error);
    }
};



//-------------------------- USER SIDE ---------------------------------------|>

//validating coupon 
module.exports.useCoupon = async (req, res) => {
    try {
        const newCode = await Coupon.findOne({ couponCode: req.body.couponCode });
     

        checkAndUpdateExpiredCoupons();


       if(!newCode.active){
        res.send({used: 'coupon already used'});
       }else{
        if(!newCode){
            res.send({invalid: "Invalid coupon code"});

        }else if (!newCode.active && newCode.expired){
            
            res.send({expired: 'Coupon Expired'})
        } else {
            const perc = newCode.discountPercentage;
            res.send({ code: perc });

          const  couponExpired =  await Coupon.updateOne({ _id: newCode._id }, { $set: { active: false } });
        }
       }

    } catch (error) {
        console.log('Try catch error in useCoupon 🤷‍♂️📀🤷‍♀️');
        console.log(error.message);
    }
};


// module.exports.coupons = async (req, res) => {
//     try {
    
//         const user = req.session.user
//         const coupons = await Coupon.find({});
//         checkAndUpdateExpiredCoupons();


//         if(coupons.startDate < coupons.expirationDate){
//          const expired = await Coupon.updateMany({expired: true});
//          if(expired){
//             console.log("coupon expired !!..");
//          }
//         }


//         const category = await Category.findOne({categoryName: 'CABINET'});

        

//         const headCategory = await getCategory();
//         res.render('user/coupons', {coupons: coupons, headCategory, user: user})
//     } catch (error) {
//         console.log('Try catch error in coupons 🤷‍♂️📀🤷‍♀️');
//         console.log(error.message);
//     }
// };







//--------------------------ADMIN SIDE ---------------------------------------|>
//generating coupon code

module.exports.generateCoupon = async(req,res)=>{
    try {
        let codeC = couponCode.generate({parts: 2});
    
        res.send({coupon: codeC })
    } catch (error) {
        console.log('Try catch error in generateCoupon 🤷‍♂️📀🤷‍♀️');
        console.log(error.message);
    }
};

//Listing coupons

module.exports.couponMg = async(req,res)=>{
    try {
    const coupons = await Coupon.find();

    res.render("admin/coupon-mg", {coupons: coupons})
    } catch (error) {
        console.log(error.message);
    }
}

// rendering add coupon  page 

module.exports.addCouponPage = async(req,res)=>{
    try {
        res.render('admin/add-coupon')
    } catch (error) {
         console.log(error.message)
    }
}

//create new coupon

module.exports.addCoupon = async(req,res)=>{
    try {
        const newCoupon = new Coupon({
            couponCode: req.body.code,
            expirationDate: req.body.expiryDate,
            discountPercentage: req.body.discountPercentage

        })

        const saveCoupon = newCoupon.save();

        if(saveCoupon){
            res.redirect('/admin/coupon');
        }else{
            console.log('coupon saving failed');
        }
    } catch (error) {
        console.log(error.message)
    }
}

//deleting coupon

module.exports.DeleteCoupon = async (req, res) => {
    try {
        const id = req.params.id;

        // checking deletion confirmation
        if (req.query.confirmation === 'true') {
            const deleteCoupon = await Coupon.findOneAndDelete({ _id: id });

            if (deleteCoupon) {
                res.redirect('/admin/coupon');
            } else {
                console.log('Error deleting coupon');
                res.redirect('/admin/coupon'); 
            }
        } else {
            
            console.log('Deletion canceled by user');
            res.redirect('/admin/coupon'); 
        }
    } catch (error) {
        console.log(error.message);
        res.redirect('/admin/coupon'); 
    }
};
