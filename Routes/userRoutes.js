import express from 'express';
import User from '../Model/userModel.js';
import {generateToken, isAuth, isAdmin} from '../utils.js';
import expressAsyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';

const userRouter= express.Router();

//http://localhost:5000/api/users

userRouter.post('/signin', expressAsyncHandler(async (req, res)=>{
    const user = await User.findOne({email: req.body.email});
    if(user){
      if(bcrypt.compareSync(req.body.password, user.password)){
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        });
        return;
      }
      else{
        res.status(401).send({message:'Invalid password'});
      }
    }
    res.status(401).send({message:'This email does not exist in our database'});
  })
  );

userRouter.post('/signup', expressAsyncHandler(async (req, res)=>{
    const newUser = new User({
      name:req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password)
    });

    const user = await newUser.save();
    res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user)
    });

  })
  );

userRouter.put('/profile', isAuth, expressAsyncHandler(async (req, res)=>{
    // console.log(req);
    const user = await User.findById(req.user._id);
    if(user){
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.password = bcrypt.hashSync(req.body.password, 8);

      const updatedUser = await user.save();
      res.send({
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser)
      })
    }

    else{
      res.status(404).send({message:'User not found'})
    }
  })
  );

//get all users
userRouter.get('/all', isAuth, isAdmin, expressAsyncHandler(async (req, res)=>{
  const allUsers = await User.find({});
  res.send(allUsers)
}));

//delete a user
userRouter.delete('/:id', expressAsyncHandler(async(req,res)=>{
  const user = await User.findById(req.params.id)

  if(user){
    if (user.email === 'admin@awesome.com') {
        res.status(400).send({ message: 'Can Not Delete Admin User' });
        return;
      }
    await user.remove();
    res.send({message: 'User Deleted'})
  } 
  else{
    res.status(404).send({message:'User not found'})
  }
}))

//get a single user
userRouter.get('/:id', isAuth, isAdmin, expressAsyncHandler(async (req, res)=>{
  const user = await User.findById(req.params.id).select('-password');
  if(user){
    res.json(user)
  } 
  else{
    res.status(404).send({message:'User not found'})
  }
}));

//update a user
userRouter.put('/:id', isAuth, isAdmin, expressAsyncHandler(async (req, res)=>{
    // console.log(req);
    const user = await User.findById(req.params.id)
    //console.log(user);
    if(user){
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isAdmin = req.body.isAdmin;
      user.updatedAt= Date.now();

      const updatedUser = await user.save();
      res.send({ message: 'User Updated', user: updatedUser })
    }

    else{
      res.status(404).send({message:'User not found'})
    }
  })
  );


export default userRouter;