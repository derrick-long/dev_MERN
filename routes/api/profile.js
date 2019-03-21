const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
//load validation
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
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
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile) {
                errors.noprofile = 'There is no profile for this user!';
                return res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
});

//route GET api/profile/all
// desc get all profiles
// access public 

router.get('/all', (req,res) => {
    const errors = {};
    Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
        if(!profiles) {
            errors.noprofiles = 'There are no profiles yet';
            return res.status(404).json(errors);
        }

        res.json(profiles);
    })
    .catch(err => res.status(404).json({ profile: 'There are no profiles'}));

})

//route GET api/profile/handle
// desc get user profile by handle
// access public 
router.get('/handle/:handle',(req,res)=>{
    const errors = {};

    Profile.findOne({ handle: req.params.handle })
        .populate('user', ['name', 'avatar'])
        .then(profile =>{
            if(!profile) {
                errors.noprofile = 'No profile for this user!';
                res.status(404).json(errors);
            } 
            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
});

//route GET api/profile/user/:user_id
// desc get profile by user id
// access public 
router.get('/user/:user_id',(req,res)=>{
    const errors = {};

    Profile.findOne({ user: req.params.user_id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile) {
                errors.noprofile = 'No profile for this user!';
                res.status(404).json(errors);
            } 
            res.json(profile);
        })
        .catch(err => res.status(404).json({ profile: 'There is no profile for this user'}));
});

//route POST api/profile/
// desc create or edit user profile
// access private

router.post('/',passport.authenticate('jwt', {session: false}),(req,res) => {
  
    const{ errors, isValid } = validateProfileInput(req.body);

    //check validation 
    if(!isValid){
        //return errors with 400 status 
        return res.status(400).json(errors);
    }
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

//route POST api/profile/experience
// desc add experience to profile
// access private

router.post('/experience',passport.authenticate('jwt', {session: false}),(req,res) => {

    const{ errors, isValid } = validateExperienceInput(req.body);

    //check validation 
    if(!isValid){
        //return errors with 400 status 
        return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id })
    .then(profile => {
        const newExp = {
            title: req.body.title,
            company: req.body.company,
            location: req.body.location,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description
        }
        // add to exp array of existing profile 
        profile.experience.unshift(newExp);
        
        profile.save()
        .then(profile => res.json(profile));
    })
});

module.exports = router;