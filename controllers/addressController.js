const { Category } = require("../models/CategorySchema");
const { Address } = require("../models/addressSchema");
const { User } = require("../models/userSchema");

// Finding Category

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

// List Addresses in userprofile 

module.exports.addressList = async(req,res)=>{
   try {
    const userId = req.session.user._id;
    const user = await User.findOne({_id:userId})
    const address = await Address.findOne({userId: userId});
    const category = await getCategory();

        res.render('user/addressList', {userAddresses:address, category,user})

   } catch (error) {
    console.log(error.message);
   }

}

// Rendering Add address page  in userprofile

module.exports.addAddressPage = async (req,res)=>{
    try {
const User = req.session.User;

const category = await getCategory();

      res.render('user/addAddressPage',{category,User})
    } catch (error) {
      console.log(error.message);
    }
}

 // Adding  addresses in userprofile

module.exports.addAddress = async (req, res) => {
    try {
     
      const userId = req.session.user._id;
      const address = await Address.findOne({ userId: userId});
  
  
      if (!address) {
        const newAddress = new Address({
          userId: userId,
          addresses: [
            {
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              landmark: req.body.landmark,
              addressDetail: req.body.addressDetail,
              state: req.body.state,
              zip: req.body.zip,
              phone: req.body.phone,
            },
          ],
        });
        await newAddress.save();
      } else {
        address.addresses.push({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          landmark: req.body.landmark,
          addressDetail: req.body.addressDetail,
          state: req.body.state,
          zip: req.body.zip,
          phone: req.body.phone,
        });
        
         await address.save();
      }
  
      // console.log(updatedUser);
  
      res.redirect("/users/addresses");
    } catch (error) {
      console.log("Try catch error in addAddress 🤷‍♂️📀🤷‍♀️");
      console.log(error.message);
    }
};

// Deleting Address from User profile

module.exports.deleteAddress = async (req, res) => {
    try {
      const userID = req.session.user._id;
      const id = req.params.id;
      const removed = await Address.findOneAndUpdate(
        { userId: userID },
        { $pull: { addresses: { _id: id } } }
      );
      console.log(removed);
      if (removed) {
        
        res.redirect('/users/addresses');
      } else {
        res.json("error");
      }
    } catch (error) {
      console.log("Try catch error in deleteAddressPage 🤷‍♂️📀🤷‍♀️");
      console.log(error.message);
    }
};

// Rendering edit address page

module.exports.editAddressPage = async (req, res) => {
  try {
    const addrId = req.params.id;
    const userId = req.session.user._id;
    console.log(addrId + " " + userId);

    const address = await Address.findOne({userId: userId})
    if (!address) {
      return res.status(404).send('Address not found');
    }

    const oneAddress = address.addresses.id(addrId);

    console.log(oneAddress + "❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️ 👌👌👌👌👌👌👌");

    const category = await getCategory();

    res.render('user/editAddressPage', { address: oneAddress, category });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};

// editing address

module.exports.editAddress = async (req, res) => {
  try {
    const addrId = req.params.id;

    const userId = req.session.user._id;
    
    if (!userId) {
      return res.send("No user id found!");
    }
  
    console.log(req.body);
  
    const addressUpdate = await Address.updateOne(
      {
        "addresses._id": addrId,
      },
      {
        $set: {
          "addresses.$.firstName": req.body.firstName,
          "addresses.$.lastName": req.body.lastName,
          "addresses.$.landmark": req.body.landmark,
          "addresses.$.addressDetail": req.body.addressDetail,
          "addresses.$.state": req.body.state,
          "addresses.$.zip": req.body.zip,
          "addresses.$.phone": req.body.phone,
        },
      }
    );
  
    if (addressUpdate) {
      console.log("Address updated successfully:", addressUpdate);
      return res.redirect("/users/addresses");
    } else {
      console.log("Error updating address data!");
      return res.status(500).send("Error updating address data");
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Internal Server Error");
  }
  };

// Adding  addresses from checkout page

  module.exports.addAddressCheckout = async(req,res)=>{
    try {

      const userId = req.session.user._id;
      const address = await Address.findOne({ userId: userId});
      const formData = req.body.formData
  
      console.log(formData + "👌👌👌👌👌👌👌👌👌👌👌👌👌👌❤️❤️❤️❤️❤️");
  
      if (!address) {
        const newAddress = new Address({
          userId: userId,
          addresses: [
            {
              firstName: formData.firstName,
              lastName: formData.lastName,
              landmark: formData.landmark,
              addressDetail: formData.addressDetail,
              state: formData.state,
              zip: formData.zip,
              phone: formData.phone,
            },
          ],
        });
        await newAddress.save();
      } else {
        address.addresses.push({
          firstName: formData.firstName,
          lastName: formData.lastName,
          landmark: formData.landmark,
          addressDetail: formData.addressDetail,
          state: formData.state,
          zip: formData.zip,
          phone: formData.phone,
        });
        
         await address.save();
      }
  
      // console.log(updatedUser);
  res.send({data: 'data' });
      
    } catch (error) {
      console.log(error)
    }
  }

  