const { User } = require("../models/userSchema");
const multer = require('multer');
const path = require('path')


module.exports.userSession = (req,res,next)=>{
    try {
        if(req.session.user){
            res.redirect('/users/home');
        }else{
            next();
        }
    } catch (error) {
        console.log(error.message)
    }
}

module.exports.adminSession = (req,res,next)=>{
    try {
        if(req.session.admin){
            res.redirect('/admin/home');
        }else{
            next();
        }
    } catch (error) {
        console.log(error.message)
    }
}



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/uploads");
    },
    filename: (req, file, cb) => {
      let ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + Date.now() + ext);
    },
  });
  
module.exports.upload = multer({
    storage: storage,
  });
  

  
  

  const storage1 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/profilePictures");
      },
      filename: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + Date.now() + ext);
      },
  });
  
  module.exports.upload1 = multer({ 
    storage: storage1 
  });
  


  module.exports.blockChecker = async(req,res,next)=>{
    try {
        const id   = req.session.user._id;
        const user = await User.findOne({_id: id});
        if(user.blocked){
            res.render("user/userblockpage")
        }else{
            next();
        }
        
    } catch (error) {
        console.log(error.message)
    }
  }