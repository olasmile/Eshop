const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.get(`/`, async (req, res) =>{
    const userList = await User.find().select('-passwordHash');

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})

router.post('/', async (req, res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 13),
        street: req.body.street,
        apartment: req.body.apartment,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
    })
    user = await user.save();
    if(!user)
    return res.status(404).send('The user can not be created!')
    res.send(user);
})

router.post('/register', async (req, res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 13),
        street: req.body.street,
        apartment: req.body.apartment,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
    })
    user = await user.save();
    if(!user)
    return res.status(400).send('The user can not be created!')
    res.send(user);
})

router.get('/:id', async(req, res)=>{
    const user = await User.findById(req.params.id).select('-passwordHash');

    if(!user){
        res.status(500).json({message: 'The user with the given ID was not found'})
    }
    res.status(200).send(user);
})

router.put('/:id', async(req, res)=>{

    const userExist = await User.findById(req.params.id);
    let newPassword
    if(req.body.password){
        newPassword = bcrypt.hashSync(req.body.password, 13)
    } else {
        newPassword = userExist.passwordHash;
    }
     
    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,
            street: req.body.street,
            apartment: req.body.apartment,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
        },
        {new: true}
    )
    if(!user)
    return res.status(400).send('The user can not be updated!')
    res.send(user);
})

router.post('/login', async (req, res) =>{
     const user = await User.findOne({ email: req.body.email})
     const secret = process.env.secret;

     if(!user){
         return res.status(404).send('User not found');
     }

     if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
         const token = jwt.sign(
             {
             user: user.id,
             isAdmin: user.isAdmin
             },
             secret,
             {expiresIn: '1d'}
         )
         res.status(200).send({user: user.email, token: token})
     }else{
        return res.status(400).send('Password is wrong');
     }

})

router.get(`/get/count`, async (req, res) =>{
    const userCount = await User.countDocuments()

    if(!userCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        userCount: userCount
    });
})

router.delete(`/:id`, async (req, res)=>{
    const user = await User.findByIdAndRemove(
        req.params.id
    )
    if(!user)
    return res.status(400).json({success: false, message: 'user not found'})
    
    res.status(200).json({success: true, message: 'The user is deleted successfully'});
})


module.exports =router;