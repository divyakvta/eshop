const { Orders } = require("../models/orderSchema");


// Rendering sales report page

module.exports.salesReportPage = async(req,res)=>{
    try {
        res.render('admin/sales-report');
    } catch (error) {
        console.log(error.message)
    }
}

//Generating sales Report

module.exports.salesReport = async (req, res) => {
    try {
      const startDateString = req.body.startDate;
      const endDateString = req.body.endDate;
  
      console.log(endDateString);
  
      const startDate = new Date(startDateString);
      const endDate = new Date(endDateString);
  
      console.log(startDate + "🔥🔥🔥🔥🔥🔥🔥" + endDate);
  
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).send('Invalid date format. Please provide valid dates.');
      }
  
      const allOrders = await Orders.aggregate([
        {
          $match: {
            orderStatus: 'Delivered',
          },
        },
      ]);
  
      const ordersWithinDateRange = [];
  
      for (const order of allOrders) {
        const orderDate = new Date(order.createdAt);
  
        if (orderDate > startDate && orderDate < endDate) {
          ordersWithinDateRange.push(order);
        }
      }
  
      // console.log(ordersWithinDateRange);
  
      const orders = ordersWithinDateRange;
  
      // Initialize variables to store aggregated data
      let totalSales = 0;
      let totalOrders = 0;
  
      orders.forEach((order) => {
        totalSales += parseInt(order.totalPaid);
        totalOrders++;
      });
  
      // Calculate average order value
      const averageOrderValue = totalOrders > 0 ? Math.ceil(totalSales / totalOrders) : 0;
  
      const salesReport = {
        totalSales: parseInt(totalSales),
        totalOrders: parseInt(totalOrders),
        averageOrderValue: parseInt(averageOrderValue),
        orders: orders.map((order) => ({
          orderId: order._id.toString(),
          totalPrice: parseInt(order.totalPaid),
          orderStatus: order.orderStatus,
          address: order.address,
        })),
      };
  
      console.log(salesReport);
      //
  
      res.send(salesReport);
    } catch (error) {
      console.log(error.message);
      console.log('Try catch error in salesReport 🤷‍♂️📀🤷‍♀️');
    }
  };
  
  