import express from 'express';
import Product from '../Model/productModel.js';
import User from '../Model/userModel.js';
import Order from '../Model/orderModel.js';
import data from '../data.js';
import {isAuth, isAdmin} from '../utils.js';

const seedRouter = express.Router();

seedRouter.get('/', async(req,res) =>{
  await Product.remove({});
  const createdProducts = await Product.insertMany(data.products);

  await User.remove({});
  const createdUsers = await User.insertMany(data.users);

  await Order.remove({});

  res.send({createdProducts, createdUsers});
}); 

export default seedRouter;