
const express = require('express');
const { adminSession, upload } = require('../middleware/middleware');
const { categoryPage, addCategory, deactivateCategory, activateCategory, editCategoryPage, editCategory, addProductPage, productListPage, 
        addProduct, editProductPage, updateProduct, deleteProduct, addCategoryOfferPage, addCategoryOffer, deleteCategoryOffer, ProductOfferPage, addProductOffer, productPaginate, adminProductPaginate,  } = require('../controllers/productController');
const { adminHome, adminLoginVerify, userManegement, userBlock, userUnBlock, adminLogout, adminLoginPage, adminDashboard } = require('../controllers/adminController');
const { orderList, orderDdetail, UpdateOrderStatus, allowReturn } = require('../controllers/orderController');
const { couponMg, generateCoupon, addCouponPage, addCoupon, DeleteCoupon } = require('../controllers/couponController');
const { salesReportPage, salesReport } = require('../controllers/salesController');
const { dashboard } = require('../controllers/dashController');




const router = express.Router();

router.get('/',adminSession,adminLoginPage);

router.post('/login-verify',adminSession, adminLoginVerify);

router.get('/adminlogout',adminLogout);

router.get('/dashboard', dashboard)

router.get('/adminhome', adminHome);

router.get('/category',categoryPage)

router.post('/add-category',addCategory);

router.get('/deactivate-category/:id',deactivateCategory)

router.get('/activate-category/:id',activateCategory)

router.get('/edit-category-page/:id',editCategoryPage)

router.post('/edit-category/:id',editCategory)

router.get('/product',productListPage);

router.post('/paginate', adminProductPaginate)

router.post('/generate-coupon', generateCoupon)

router.get('/coupon', couponMg);

router.get('/add-couponPage', addCouponPage)

router.get('/delete-coupon/:id', DeleteCoupon);

router.post('/add-coupon', addCoupon)

router.get('/add-product-Page',addProductPage);

router.get('/order-detail/:id', orderDdetail);

router.post('/add-product', upload.array('images', 5), addProduct);

router.get('/edit-product-page/:productId',editProductPage)

router.post('/update-product/:productId', upload.array('images', 5), updateProduct);

router.get('/delete-product/:productId',deleteProduct);

router.get('/user-management',userManegement)

router.get('/block/:id',userBlock)

router.get('/unblock/:id',userUnBlock)

router.get('/order-list',orderList)

router.post('/updateOrderStatus', UpdateOrderStatus);

router.get("/aprove-return/:id", allowReturn)

router.get('/category-offer-page/:id', addCategoryOfferPage);

router.post('/add-category-offer/:id', addCategoryOffer);

router.get('/product-offer-page/:id', ProductOfferPage);

router.post('/add-product-offer/:id', addProductOffer);

router.get('/sales-report', salesReportPage);

router.post('/report-download', salesReport);






module.exports = router;