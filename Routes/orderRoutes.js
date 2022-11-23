import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../Model/orderModel.js';
import User from '../Model/userModel.js';
import Product from '../Model/productModel.js';
import {isAuth, isAdmin} from '../utils.js';

const orderRouter = express.Router();

orderRouter.post('/', isAuth, expressAsyncHandler(async (req,res)=>{
  const newOrder= new Order({
    orderItems: req.body.orderItems.map((a)=>({...a, product:a._id})),
    shippingAddress: req.body.shippingAddress,
    paymentMethod: req.body.paymentMethod,
    itemsPrice: req.body.itemsPrice,
    shippingPrice: req.body.shippingPrice,
    taxPrice: req.body.taxPrice,
    totalPrice: req.body.totalPrice,
    user: req.user._id,
  });

  const order = await newOrder.save();
  res.status(201).send({message: 'New Order Created', order});
})
);

orderRouter.get('/mine', isAuth,
  expressAsyncHandler(async(req,res)=>{
    const orders = await Order.find({user: req.user._id});
    res.send(orders);
  }
  ));

orderRouter.get('/all', isAuth, isAdmin, 
  expressAsyncHandler(async(req,res)=>{
    const allOrders = await Order.find({}).populate('user', 'id name');
    if(allOrders){
      res.send(allOrders)
    }
    else{
      res.status(404).send({message: 'No orders!'})
    }
  })
  )

orderRouter.get('/summary', isAuth, isAdmin,
  expressAsyncHandler(async(req,res)=>{
    const orders = await Order.aggregate([{
      $group:{
        _id: null, numOrders:{$sum:1}, totalSales:{$sum: '$totalPrice'}
      }
    }]);

    const users = await User.aggregate([{
      $group: {
        _id: null, numUsers: { $sum: 1 }
        },
      }]);

    const products = await Product.aggregate([{
      $group:{
        _id: null, numProducts:{$sum:1}
      }
    }]);


    res.send({orders, users, products})
  }));

orderRouter.get('/:id', isAuth, 
  expressAsyncHandler(async(req,res)=>{
  const order = await Order.findById(req.params.id);
  if(order){
    res.send(order);
  }
  else{
    res.status(404).send({message: 'Could not find the order'});
  }
}));

orderRouter.put('/:id/pay', isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      res.send({ message: 'Order Paid', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

orderRouter.put('/:id/deliver', isAuth, isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;      
      order.deliveredAt = Date.now();

      const updatedOrder = await order.save();
      res.send({ message: 'Order Delivered', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);



export default orderRouter;

