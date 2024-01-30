const { Orders } = require("../models/orderSchema");
const { Product } = require("../models/productShema");
const { User } = require("../models/userSchema");



module.exports.dashboard = async (req, res) => {
  try {
    // COD Orders
    const codOrders = await Orders.aggregate([
      { $match: { paymentMethod: "COD" } }, // Change "PaymentMethod" to "paymentMethod"
      { $group: { _id: null, totalPrice: { $sum: "$totalPrice" } } },
    ]);

    const codTotalAmount = codOrders.length > 0 ? codOrders[0].totalPrice : 0;

    console.log("COD Orders:", codOrders);
    console.log("Total amount from COD orders:", codTotalAmount);

    // Razorpay Orders
    const razorpayOrders = await Orders.aggregate([
      { $match: { paymentMethod: "Razorpay" } }, // Change "PaymentMethod" to "paymentMethod"
      { $group: { _id: null, totalPrice: { $sum: "$totalPrice" } } },
    ]);

    const razorpayTotalAmount = razorpayOrders.length > 0 ? razorpayOrders[0].totalPrice : 0;

    console.log("Razorpay Orders:", razorpayOrders);
    console.log("Total amount from Razorpay orders:", razorpayTotalAmount);

    // Total Revenue
    const totalRevenue = razorpayTotalAmount + codTotalAmount;
    console.log("Total revenue =", totalRevenue);

    // Delivered Orders
    const deliveredOrders = await Orders.aggregate([
      { $match: { orderStatus: 'Delivered' } },
      { $count: 'deliveredOrders' },
    ]);

    const totalDeliveredOrders = deliveredOrders.length > 0 ? deliveredOrders[0].deliveredOrders : 0;
    console.log("Delivered Orders:", totalDeliveredOrders);

    // Returned Orders
    const returnedOrders = await Orders.aggregate([
      { $match: { orderStatus: 'Order Returned', returned: true } },
      { $count: 'returnedOrders' },
    ]);

    const totalReturnedOrders = returnedOrders.length > 0 ? returnedOrders[0].returnedOrders : 0;
    console.log("Returned Orders:", totalReturnedOrders);

    // Canceled Orders
    const canceledOrders = await Orders.aggregate([
      { $match: { canceled: true } },
      { $count: 'canceledOrders' },
    ]);

    const totalCanceledOrders = canceledOrders.length > 0 ? canceledOrders[0].canceledOrders : 0;
    console.log("Canceled Orders:", totalCanceledOrders);

    // Total Orders
    const totalOrderCount = await Orders.countDocuments();
    console.log("Total Orders:", totalOrderCount);

    // Fetch Users (Assuming you have a User model)
    const users = await User.find().limit(5);

    // Fetch Latest Products
    const latestProducts = await Product.find().sort({ dateCreated: -1 }).limit(4);

    res.render('admin/dashboard', {
      codTotalAmount,
      razorpayTotalAmount,
      totalRevenue,
      users,
      latestProducts,
      deliveredOrders:totalDeliveredOrders,
      returnedOrders:totalReturnedOrders,
      canceledOrders:totalCanceledOrders,
      totalOrders:totalOrderCount,
    });
  } catch (error) {
    console.error("Error in dashboard controller:", error);
    res.status(500).send("Internal Server Error");
  }
};



