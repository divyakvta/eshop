const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { User } = require('../models/userSchema');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const { Product } = require('../models/productShema');
const { Category } = require('../models/CategorySchema');
const jwt = require('jsonwebtoken'); 
const Referral = require('../models/refferalSchema');
const { Wallet } = require('../models/walletSchema');
const { Transaction } = require('../models/walletTransactionSchema');

// Finding category

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


// User signup page Rendering 

module.exports.userSignupPage =async (req,res) => {
  try{

    const code = req.query.reflink;
    
    const deletedUsers = await User.deleteMany({ verify: false });

    const reflinkUser = await User.findOne({refferalCode: code});




    if (deletedUsers.deletedCount > 0) {
      console.log(`${deletedUsers.deletedCount} unverified users deleted successfully.`);
    } else {
      console.log("No unverified users found for deletion.");
    }

    if(code){

      console.log(req.query.reflink + '😘');
    console.log(reflinkUser);


      res.render('user/usersignup', {refUser: reflinkUser._id});
    }else{
      res.render('user/usersignup', {refUser: ''});

    }


  }catch(error){
      console.log(error.message)
  }
}


//Gerarating otp and creating User with details
 
module.exports.userRegister = async (req, res) => {
    try {
      


      
     

        console.log(req.body);

        const refUser = req.body.refUser;

        


        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password,10)

        
        const OTP = otpGenerator.generate(6, {
          upperCaseAlphabets: true,
          lowerCaseAlphabets: false,
          specialChars: false,
          digits: false,
        });

        const reffelCode = otpGenerator.generate(12, {
          upperCaseAlphabets: true,
          lowerCaseAlphabets: true,
          specialChars: false,
          digits: true,
        });

        console.log(reffelCode + "🤦‍♀️");

    const existingUser = await User.findOne({email:req.body.email});
    if(existingUser) {
      res.status(400).json({error:'Email Already Registered'})
    } 

    
        const newEmail = req.body.email;

        const userData = new User({
            username: req.body.username,
            email: newEmail,
            phone:req.body.phone,
            password: hashedPassword, // Use the hashed password
            isAdmin: 0,
            refferalCode: reffelCode,
            otp: OTP
        });

        const savedUser = await userData.save();



        console.log(savedUser);

   

        const sendVerifyMail = async (email, otp) => {
          try {
            const https = require('https');
      
            const agent = new https.Agent({
              rejectUnauthorized: false, // Set this to true in production
            });
      
            const transporter = nodemailer.createTransport({
              host: process.env.MAIL_HOST,
              port: 587,
              secure: false,
              requireTLS: true,
              auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
              },
              tls: {
                rejectUnauthorized: false, // Set this to true in production
              },
              agent, // Pass the agent to nodemailer
            });
      
            const mailOptions = {
              from: 'divya@gmail.com',
              to: email,
              subject: 'Verification Mail',
              html: `<p>Hi, your OTP for signing up is: ${otp}</p>`,
            };
            
            // Promisify sendMail
            const sendMailPromise = new Promise((resolve, reject) => {
              transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  console.error(error);
                  reject(error);
                } else {
                  console.log('Email has been sent', info.response);
                  resolve(info);
                }
              });
            });
      
            // Wait for the email to be sent
            await sendMailPromise;
      
            return true; // Indicate success
          } catch (error) {
            console.error(error.message);
            return false; // Indicate failure
          }
        };
    
        const sendMailResult = await sendVerifyMail(newEmail, OTP);
    
      

  if(sendMailResult){
    
       
       if (savedUser) {

        if(refUser === ''){
          res.render('user/otp', { user: savedUser, refUser: '' });
        }else{
          res.render('user/otp', { user: savedUser,refUser: refUser });
          
        }

      } else {
           res.render('user/usersignup', { message: 'Your Registration has failed' });
       }
  }else{
    console.log("error sending ..");
  }

        } catch (error) {
            console.log(error.message);
            res.render('user/usersignup', { message: 'An error occurred during registration' });
        }
};

//Otp varification and Refferal offer updations

module.exports.otpVerify = async (req, res) => {
  try {
    const otp = req.body.otp;
    const user = await User.findOne({ _id: req.body.id });

    const refUser = req.body.refUser;

    console.log(refUser);

    if (user && user.otp !== otp) {
      res.send('Incorrect otp');
    } else {
      const generatedRefLink = `${req.protocol}://${req.headers.host}/users?reflink=${user.refferalCode}`;

      user.refferalLink = generatedRefLink;
      user.verify = true;
      await user.save();

      if (refUser) {
        const refUserWallet = await Wallet.findOne({ userId: refUser });
        const refUserTransaction = await Transaction.findOne({ userId: refUser });

        const referralSchemaExist = await Referral.findOne({ referringUserId: refUser });

        if (referralSchemaExist) {
          const wallet = new Wallet({
            userId: user._id,
            walletBalance: 50,
          });

          const transaction = new Transaction({
            userId: user._id,
            transaction: [{ mode: 'Credit   referral offer', amount: 50 }],
          });

          await wallet.save();
          await transaction.save();

          if (referralSchemaExist.usedUsers < 5) {
            referralSchemaExist.referredUsersId.push({ id: user._id });
            referralSchemaExist.usedUsers += 1;

            await referralSchemaExist.save();

            if (refUserWallet) {
              refUserWallet.walletBalance += 50;
              await refUserWallet.save();

              refUserTransaction.transaction.push({ mode: 'Credit   referral offer', amount: 50 });
              await refUserTransaction.save();
            } else {
              const wallet = new Wallet({
                userId: refUser,
                walletBalance: 50,
              });

              const transaction = new Transaction({
                userId: refUser,
                transaction: [{ mode: 'Credit   referral offer', amount: 50 }],
              });

              await wallet.save();
              await transaction.save();
            }
          } else {
            referralSchemaExist.status = false;
          }
        } else {
          const wallet = new Wallet({
            userId: user._id,
            walletBalance: 50,
          });

          const transaction = new Transaction({
            userId: user._id,
            transaction: [{ mode: 'Credit   referral offer', amount: 50 }],
          });

          await wallet.save();
          await transaction.save();

          const referralSchema = new Referral({
            referringUserId: refUser,
            referredUsersId: [{ id: user._id }],
            usedUsers: 1,
          });

          await referralSchema.save();

          if (refUserWallet) {
            refUserWallet.walletBalance += 50;
            await refUserWallet.save();

            refUserTransaction.transaction.push({ mode: 'Credit   referral offer', amount: 50 });
            await refUserTransaction.save();
          } else {
            const wallet = new Wallet({
              userId: refUser,
              walletBalance: 50,
            });

            const transaction = new Transaction({
              userId: refUser,
              transaction: [{ mode: 'Credit   referral offer', amount: 50 }],
            });

            await wallet.save();
            await transaction.save();
          }
        }
      }
      res.render('user/userlogin');
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
};

//Generating new otp and sending otp(for resend otp)

module.exports.resendOtp = async(req,res)=>{
  try {
      
  
    
    const newOTP = otpGenerator.generate(6, {
      upperCaseAlphabets: true,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });

    const userId = req.params.id;

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { otp: newOTP } }, 
      { new: true })

console.log(user)
console.log('Generated OTP:', newOTP);

    const newEmail = user.email;

   

    const sendVerifyMail = async (email, otp) => {
      try {
        const https = require('https');
  
        const agent = new https.Agent({
          rejectUnauthorized: false, 
        });
  
        const transporter = nodemailer.createTransport({
          host: process.env.MAIL_HOST,
          port: 587,
          secure: false,
          requireTLS: true,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
          },
          tls: {
            rejectUnauthorized: false, 
          },
          agent, 
        });
  
        const mailOptions = {
          from: 'divya@gmail.com',
          to: email,
          subject: 'Verification Mail',
          html: `<p>Hi, your OTP for signing up is: ${otp}</p>`,
        };
        
        
        const sendMailPromise = new Promise((resolve, reject) => {
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.error(error);
              reject(error);
            } else {
              console.log('Email has been sent', info.response);
              resolve(info);
            }
          });
        });
  
        
        await sendMailPromise;
  
        return true; // Indicate success
      } catch (error) {
        console.error(error.message);
        return false; // Indicate failure
      }
    };

    const sendMailResult = await sendVerifyMail(newEmail, newOTP);

if(sendMailResult){
    res.render('user/otp', {user: user})
}else{
console.log("error sending ..");
}
 
    } catch (error) {
        console.log(error.message);
    }
}

// Varifying user and generating JWT tocken

module.exports.userLoginVarify = async (req, res) => {
  try {
    const { email, password } = req.body;

    
    const user = await User.findOne({ email: email });

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        req.session.user = user;

        // Generate the token
        const token = jwt.sign({ user: user._id}, 'your-secret-key', { expiresIn: '24h' });
        res.cookie('jwt',token,{httpOnly:true})

        // Send JSON response with authentication details and redirect URL
        res.json({user: user._id});
      } else {
        console.log('password not correct..');
        res.status(401).json({ error: 'Invalid password' }); 
      }
    } else {
      console.log('email not found..');
      res.status(401).json({ error: 'Invalid email' }); 
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'An error occurred while logging in' });
  }
};


// Rendering user login page

module.exports.userLoginPage = (req,res) => {
    try{
        res.render('user/userlogin')
    }catch(error){
        console.log(error.message);
    }
}



//User home page Rendering 
module.exports.userHomePage = async (req, res) => {
    try {
        
        const userData = await User.findById(req.session.user._id);

        const product = await Product.find({deleted: false})

        if (!userData) {
            
            return res.status(404).send("User not found");
        }

        const category = await getCategory(); 

        res.render('user/all-products', { user: userData, category,product });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};

// User product list page rendering 

module.exports.productListPage = (req,res)=> {
  try{

    res.render('user/listproduct')
    
  }catch(error){
    console.log(error.message)
  }
}

//User logout function

module.exports.userLogout = (req, res) => {
  try {
      // Destroy the session on the server side
      req.session.destroy();

      // Clear the 'jwt' cookie on the client side
      res.clearCookie('jwt');

      
      if (typeof localStorage !== 'undefined') {
          
          localStorage.removeItem("jwtToken");
      }

      
      res.redirect('/users/login');
  } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};

// User profile page rendering

module.exports.userProfile = async(req,res)=>{
    try {
    const userId = req.session.user._id;
    const user = await User.findOne({_id: userId})
    const category = await getCategory()
    res.render('user/userProfile', {user: user, category})
    } catch (error) {
    console.log(error.message)
    }
} 

   
// Rendering user profile edit page

module.exports.editProfilePage = async(req,res)=>{
    try {
      const userId = req.session.user._id;
      console.log(userId + "👍");
      const user = await User.findOne({_id: userId});
      const category = await getCategory()
    
      res.render('user/editProfilePage', {user: user, category })
    } catch (error) {
      console.log(error.message);
    }
}

//Editing user profile page

module.exports.editProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).send("No user id found!");
    }

    let updateFields = {
      username: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    };

    
    if (req.file) {
      updateFields.image = req.file.filename;
    }

    const userUpdate = await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: updateFields,
      },
      { new: true }
    );

    if (userUpdate) {
      console.log("User data updated successfully:", userUpdate);
      return res.redirect("/users/profile");
    } else {
      console.log("Error updating user data!");
      return res.status(500).send("Error updating user data");
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Internal Server Error");
  }
};

  
// Rendering forgot password  page

module.exports.forgotPasswordPage = async(req,res)=>{
  try {
    res.render('user/userForgotPass');
  } catch (error) {
    console.log(error.message)
  }
}

//Generating otp and Rendering reset password page

module.exports.sendPassResetMail = async(req,res)=>{
  try {


    const OTP = otpGenerator.generate(6, {
      upperCaseAlphabets: true,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: false,
    });

    const newEmail = req.body.email;
    
    const sendVerifyMail = async (email, otp) => {
      try {
        const https = require('https');
  
        const agent = new https.Agent({
          rejectUnauthorized: false, // Set this to true in production
        });
  
        const transporter = nodemailer.createTransport({
          host: process.env.MAIL_HOST,
          port: 587,
          secure: false,
          requireTLS: true,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
          },
          tls: {
            rejectUnauthorized: false, 
          },
          agent, // Pass the agent to nodemailer
        });
  
        const mailOptions = {
          from: 'divya@gmail.com',
          to: email,
          subject: 'Verification Mail',
          html: `<p>Hi, your OTP for signing up is: ${otp}</p>`,
        };
        
        // Promisify sendMail
        const sendMailPromise = new Promise((resolve, reject) => {
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.error(error);
              reject(error);
            } else {
              console.log('Email has been sent', info.response);
              resolve(info);
            }
          });
        });
  console.log(OTP);
        
        await sendMailPromise;
  
        return true; 
      } catch (error) {
        console.error(error.message);
        return false; 
      }
    };

    const sendMailResult = await sendVerifyMail(newEmail, OTP);

    const user = await User.findOne({email: newEmail});

    user.otp = OTP;

    const userOtpUpdated = await user.save();

    if(userOtpUpdated){

      res.render('user/resetPassword', {user: user});

    }else{

      console.log('User otp for Resending password failed.... ');

    }

  } catch (error) {
    console.log(error.message)
  }
}

// Resetting the password

module.exports.AddNewPassword = async (req, res) => {
  try {
    const id = req.params.id;
    const password = req.body.password;
    const otp = req.body.otp;

    const user = await User.findOne({ _id: id });

    if (user.otp === otp) {
      // Bcrypt the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;

      const savePass = await user.save();

      if (savePass) {
        res.redirect('/users/login');
      } else {
        res.send('Password saving failed');
      }
    } else {
      res.render('user/resetPassword', { user: user });
    }
  } catch (error) {
    console.log(error.message);
  }
};



module.exports.sendRefferalLink = async(req,res)=>{
  try {

    const refferal = req.body.referalLink;
    console.log(refferal + "hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii")
    const email = req.body.email
    const sendVerifyMail = async (email, refferal) => {
      try {
        const https = require('https');
  
        const agent = new https.Agent({
          rejectUnauthorized: false, // Set this to true in production
        });
  
        const transporter = nodemailer.createTransport({
          host: process.env.MAIL_HOST,
          port: 587,
          secure: false,
          requireTLS: true,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
          },
          tls: {
            rejectUnauthorized: false, // Set this to true in production
          },
          agent, // Pass the agent to nodemailer
        });
  
        const mailOptions = {
          from: 'divya@gmail.com',
          to: email,
          subject: 'Verification Mail',
          html: `<p>Hi, use this link to signup: ${refferal}</p>`,
        };
        
        // Promisify sendMail
        const sendMailPromise = new Promise((resolve, reject) => {
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.error(error);
              reject(error);
            } else {
              console.log('Email has been sent', info.response);
              resolve(info);
            }
          });
        });
  
        // Wait for the email to be sent
        await sendMailPromise;
  
        return true; // Indicate success
      } catch (error) {
        console.error(error.message);
        return false; // Indicate failure
      }
    };

    const sendMailResult = await sendVerifyMail(email, refferal);

    if(sendMailResult){
      res.redirect("/users/profile");
    }else{
      console.log('sending email failed')
    }

  
  } catch (error) {
    console.log(error.message);
  }
}

    