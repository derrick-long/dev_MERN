const express = require('express');
const router = express.Router();


// load user model
const User = require('../../models/User');

//route GET api/users/test
// desc tests users route
// access public

router.get('/test', (req,res)=>
    res.json({msg: "howdy partner users works"}));


//route GET api/users/register
// desc register user
// access public

router.post('/register', (req,res) => {
    User.findOne({ email: req.body.email })
    .then(user => {
        if(user){
            return res.status(400).json({email: 'Email already exists'});
        } else {
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                avatar,
                password: req.body.password
            });
        } 
    })
});


module.exports = router;