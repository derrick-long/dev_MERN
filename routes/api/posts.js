const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
//models 
const Post = require('../../models/Posts');
const Profile = require('../../models/Profile');
//validation 
const  validatePostInput = require('../../validation/post');

//route GET api/posts/test
// desc tests post route
// access public

router.get('/test', (req,res)=>
    res.json({msg: "howdy partner posts works"}));


//route GET api/posts/
// desc get all posts route
// access public
router.get('/', (req,res)=> {
    Post.find()
    .then(posts => {
        if (posts.length > 1 || posts == undefined) {
            res.status(404).json({nopostsfound: 'No Posts Added'});
        } 
    posts.sort({ date: -1})
    res.json(posts)
    })
        .catch(err => res.status(404).json({nopostsfound: 'No Posts Added'}))

});

//route GET api/posts/:id
// desc get post by id 
// access public
router.get('/:id', (req,res)=> {
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => res.status(404).json({nopostfound: 'No Post Found with that id!'}));
    });

 //route POST api/posts/
// desc create post
// access private

router.post('/',passport.authenticate('jwt', { session: false}), (req,res)=> {
    const {errors, isValid } = validatePostInput(req.body);

    if(!isValid){
        //if errors send 400 with error obj
        return res.status(400).json(errors);
    }


    const newPost =  new Post ({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id

    });

     newPost.save().then(post => res.json(post));
});

//route DELETE api/posts/:id
// desc delete post
// access private
router.delete('/:id',passport.authenticate('jwt', {session:false}), (req,res) => {
    Profile.findOne({ user: req.user.id})
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    //check for post owner
                    if(post.user.toString() !== req.user.id){
                        return res.status(401).json({ notauthorized: 'User not authorized'});
                    }

                    post.remove().then(() => res.json({success: true}))
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found'}));
        })

});

//route POST api/posts/like/:id
// desc Like post
// access private
router.post('like/:id',passport.authenticate('jwt', {session:false}), (req,res) => {
    Profile.findOne({ user: req.user.id})
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if(post.likes.filter(like => like.user.toString() === req.user.id)
                    .length > 0) {
                        return releaseEvents.status(400).json({alreadyliked: 'User already liked this post!'});
                    }

                    post.likes.unshift({ user: req.user.id });
                    post.save().then(post => res.json(post));
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found'}));
        })

});



module.exports = router;