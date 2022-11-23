import express from 'express';
import Product from '../Model/productModel.js';
import {isAuth, isAdmin} from '../utils.js';
import expressAsyncHandler from 'express-async-handler';

const productRouter = express.Router();

// http://localhost:5000/api/products

productRouter.get('/', async (req, res)=>{
  const products = await Product.find();
  res.send(products);
});



productRouter.get(
  '/slug/:slug', 
  async (req, res)=>{
  const product= await Product.findOne({ slug: req.params.slug });
  if(product){
    res.send(product);
  }
  else{
    res.status(404).send({message:'This Product doesn\'t exist'});
  }
})

productRouter.get('/categories', expressAsyncHandler(async (req, res)=>{
  const cat = await Product.find().distinct('category');
  res.send(cat);
}) );

productRouter.get(
  '/search', 
  expressAsyncHandler(async (req, res)=>{
  //console.log(req.query);
  const category = req.query.category || '';
  const searchQuery = req.query.query || '';


  const queryFilter = searchQuery && searchQuery !== 'all'
      ? { name: { $regex: searchQuery, $options: 'i',  }, }
      : {};

   const categoryFilter = category && category !== 'all' ? { category } : {};

     const products = await Product.find({
      ...queryFilter,
      ...categoryFilter,});
     //console.log(products)
     res.send(products);
}));

productRouter.get('/:id', async (req, res)=>{
  const product= await Product.findById(req.params.id);
  if(product){
    res.send(product)
  }
  else{
    res.status(404).send({message:'This Product doesn\'t exist'})
  }
});

productRouter.delete(
  '/:id', isAuth, isAdmin,
  expressAsyncHandler(async (req, res)=>{
  const product = await Product.findById(req.params.id);

  if(product){
    await product.remove();
    res.send({message: 'Product Deleted!'})
  } 
  else{
    res.status(404).send({message:'This Product doesn\'t exist'})
  }
} ));


productRouter.post(
  '/', isAuth, isAdmin,
  expressAsyncHandler(async (req, res)=>{
  const product = new Product({
    name: 'null',
    slug: 'null',
    category: 'null',
    image: '/images/sample.jpg', // 679px × 829px
    price: 0,
    countInStock: 0,
    brand: 'null',
    rating: 0,
    numReviews: 0,
    description: 'null',
  })

  const createdProject = await product.save();
  res.status(201).send(product)

}));


productRouter.put(
  '/:id', 
  expressAsyncHandler(async (req, res)=>{
  const {name, price, description,slug, category,image, countInStock, 
    brand} = req.body;

    const product = await Product.findById(req.params.id)
    if(product){
      product.name=name,
      product.price = price,
      product.description = description,
      product.category = category,
      product.slug = slug,
      product.image = image,
      product.countInStock = countInStock,
      product.brand = brand

      const updatedProduct = await product.save();
      res.status(201).send(updatedProduct);
    }
    else{
      res.status(404).send({message:'This Product doesn\'t exist'})
    }
}));

export default productRouter;