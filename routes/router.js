const express=require('express');
const router=express.Router();
const UserController=require('../controllers/usercontroller');
const upload=require('../middleware/upload');
const post=require('../middleware/post')
router.post('/register',UserController.registerUser);
router.post('/login',UserController.loginUser);
router.post('/posts',post.single('image'),UserController.posts);
router.post('/addProfile',upload.single('profilePicture'),UserController.addProfile);
router.get('/posts',UserController.getAllPosts);
router.put('/posts/:id/like',UserController.likePost);
router.post('/posts/:id/comment',UserController.addComment);
router.post('/users/follow',UserController.followUser);
module.exports=router;