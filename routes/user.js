const express = require('express');
const bodyParser = require('body-parser');

const { userLoginPage, userSignupPage, userHomePage, userLogout,userRegister, userLoginVarify, otpVerify, userProfile, editProfilePage, editProfile, resendOtp, forgotPasswordPage, sendPassResetMail, AddNewPassword, sendRefferalLink } = require('../controllers/userController');
const { userSession, blockChecker, upload, upload1 } = require('../middleware/middleware');
const { addAddress, addressList, addAddressPage, deleteAddress, editAddress, editAddressPage, addAddressCheckout } = require('../controllers/addressController');
const { listProductsPage, allProductList, productFilter, productSearch, productPaginate } = require('../controllers/productController');
const { productAddToCart, singleProductView, cart, updateQuantity, checkout, removeCartProduct, addToCartFromHome } = require('../controllers/cartController');
const { addressAndPaymentAjax, orders, orderPlaced, orderDetail, cancelOrder, verifyPayment, PaymentCheckout, returnOrder, allowReturn, wallet, walletUsage } = require('../controllers/orderController');
const { useCoupon } = require('../controllers/couponController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();
router.use(bodyParser.json());



router.get('/',userSession,userSignupPage)



router.get('/login',userSession,userLoginPage)

router.post('/register',userSession,userRegister)


router.get('/resend-email-otp/:id', resendOtp)

router.post('/verify',userSession, otpVerify)


router.post('/loginVerify', userLoginVarify)


router.use(verifyToken);



router.get('/home', userHomePage)

router.get('/list-product',listProductsPage)

router.get('/logout',userLogout)

router.get('/category-list',blockChecker, listProductsPage)

router.post('/product-filter',productFilter)

router.post('/product-search', productSearch)

router.get('/add-to-cart1/:productId',blockChecker,addToCartFromHome)

router.get('/add-to-cart/:productId',blockChecker, productAddToCart)

router.get('/cart',blockChecker, cart);

router.post('/updateQuantity', updateQuantity);

router.get('/cart-remove/:id', removeCartProduct)

// router.get('/all-products',allProductList)

router.get('/product-single-view/:productId',blockChecker,singleProductView)

router.get('/profile',blockChecker, userProfile);

router.get("/edit-product-page",blockChecker, editProfilePage);

router.post('/edit-profile/:id',upload1.single('profilePicture'), editProfile);

router.get("/addresses",blockChecker, addressList);

router.get('/add-address-page',blockChecker, addAddressPage);

router.post('/add-address', addAddress)

router.get('/delete-address/:id',blockChecker, deleteAddress);

router.get('/edit-address-page/:id', blockChecker,editAddressPage)

router.post('/edit-address/:id',editAddress)

router.get('/checkout',blockChecker, checkout);

router.post('/add-address-checkout', addAddressCheckout)

router.post("/check-out",blockChecker, addressAndPaymentAjax);

router.get('/orders',blockChecker, orders);

router.get('/place-order/:id',blockChecker, orderPlaced);

router.post('/checkout-payment', PaymentCheckout);

router.post('/verify-payment', verifyPayment);

router.get('/view-order-detail/:id',blockChecker, orderDetail);

router.get('/cancel-order/:id',blockChecker, cancelOrder)

router.get('/return-order/:id',returnOrder)

router.get('/wallet', wallet);

router.post('/use-wallet', walletUsage);

router.post('/paginate',productPaginate);

router.post('/use-coupon', useCoupon);

router.get('/forgot-password', forgotPasswordPage);

router.post('/reset-Password', sendPassResetMail);

router.post('/add-newPassword/:id', AddNewPassword);

router.post("/send-Refferal", sendRefferalLink)







module.exports = router;