const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// load models 
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//route GET api/profile/test
// desc tests profile route
// access public

router.get('/test', (req,res)=>
    res.json({msg: "howdy partner profile works"}));

//route GET api/profile/
// desc get current users' profile
// access private

router.get('/',passport.authenticate('jwt', {session: false}),(req,res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if(!profile) {
                errors.noprofile = 'There is no profile for this user!';
                return res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
});

//route POST api/profile/
// desc create or edit user profile
// access private

router.post('/',passport.authenticate('jwt', {session: false}),(req,res) => {
    const errors = {};
   // get fields 
   const profileFields = {};
   profileFields.user = req.user.id;
   if(req.body.handle) profileFields.handle = req.body.handle;
   if(req.body.handle) profileFields.company = req.body.company;
   if(req.body.handle) profileFields.website = req.body.website;
   if(req.body.handle) profileFields.location = req.body.location;
   if(req.body.handle) profileFields.bio =  req.body.bio;
   if(req.body.handle) profileFields.status = req.body.status;
   if(req.body.handle) profileFields.githubusername = req.body.githubusername;
   //split into array 
   if(typeof req.body.skills !== 'undefined'){
       profileFields.skills = req.body.skills.split(',');
   }

   //social 

    profileFields.social = {};
    if(req.body.youtube) profileFields.social.youtube= req.body.youtube;
    if(req.body.twitter) profileFields.social.twitter= req.body.twitter;
    if(req.body.facebook) profileFields.social.facebook= req.body.facebook;
    if(req.body.instagram) profileFields.social.instagram= req.body.instagram;

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if(profile) {
                //update
                Profile.findOneAndUpdate({ user: req.user.id}, { $set: profileFields }, {new: true })
                .then(profile => res.json(profile));
            } else {
                //create
                Profile.findOne({ handle: profileFields.handle })
                .then(profile => {
                    if(profile){
                        errors.handle = 'That handle already exists';
                        res.status(400).json(errors);
                    }
                    //save 
                    new Profile(profileFields).save()
                    .then(profile => res.json(profile));
                })
            }
        });
});

module.exports = router;