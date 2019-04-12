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
    .sort({ date: -1})
    .then(posts => {
        if (posts.length < 0 || posts == undefined) {
           res.status(404).json({nopostsfound: 'No Posts Added'});
        } 
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
router.post('/like/:id',passport.authenticate('jwt', {session:false}), (req,res) => {
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


//route POST api/posts/unlike/:id
// desc unlike post
// access private
router.post('/unlike/:id',passport.authenticate('jwt', {session:false}), (req,res) => {
    Profile.findOne({ user: req.user.id})
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if(post.likes.filter(like => like.user.toString() === req.user.id)
                    .length === 0) {
                        return releaseEvents.status(400).json({notliked: 'You have not liked this post!'});
                    }
                    // get remove index 
                    const  removeIndex = post.likes
                        .map(item => item.user.toString())
                        .indexOf(req.user.id);
                    // remove from array 
                    post.likes.splice(removeIndex, 1);
                    
                    post.save().then(post => res.json(post));
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found'}));
        })

});

//route POST api/posts/comment/:id
// desc add comment to post
// access private

router.post('/comment/:id', passport.authenticate('jwt', {session:false}), (req,res) => {

    const {errors, isValid } = validatePostInput(req.body);

    if(!isValid){
        //if errors send 400 with error obj
        return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
        .then(post => {
            const newComment = {
                text: req.body.text,
                name: req.body.name, 
                avatar: req.body.avatar,
                user: req.user.id 
            }

            post.comments.unshift(newComment);

            post.save().then(post => res.json(post))
        })
        .catch(err => res.status(404).json({ postnotfound: 'No Post Found'}));
})

//route DELETE api/posts/comment/:id
// desc remove comment from post
// access private

router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {session:false}), (req,res) => {

    Post.findById(req.params.id)
        .then(post => {
            // make sure comment exists 
        if(post.comments.filter(comment => comment._id.toString() == req.params.comment_id)
        .length === 0) { 
            return res.status(404).json({ commentnotfound: 'Comment does not exist!'});
        }

        // //get remove index 
        const removeIndex = post.comments
            .map(item => item._id.toString())
            .indexOf(req.params.comment_id);
        
        //     //splice out of array 
        post.comments.splice(removeIndex, 1);

        post.save().then(post => res.json(post));
        

        })
        .catch(err => res.status(404).json({ postnotfound: 'No Post Found'}));
})



module.exports = router;