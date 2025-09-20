const UserModel=require('../models/user');
const crypt=require('bcrypt');
const PostModel=require('../models/post');
const Reel=require('../models/reel');
const Message=require('../models/Message');
exports.registerUser=async(req,res)=>{
    const {username,email,password}=req.body;
    const newPassword=await crypt.hash(password,10);
    try{
        const existingUser=await UserModel.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"User already exists"});
        }else{
            const newUser=new UserModel({username,email,password:newPassword});
            await newUser.save();
            return res.status(201).json({message:"User registered successfully"});
        }
    }catch(error){
        return res.status(500).json({message:"Server error"});
    }
};

exports.loginUser=async (req,res)=>{
    const {email,password}=req.body;
    try{
        const user=await UserModel.findOne({email});
        if(user.length===0){
            return res.status(400).json({message:"User not found"});
        }else{
            const isMatch=await crypt.compare(password,user.password);
            if(!isMatch){
                return res.status(400).json({message:"Invalid credentials"});
            }else{
                return res.status(200).json({message:"Login successful",user});
            }
        }
    }catch(error){
        return res.status(500).json({message:"Server error"});
    }
}

exports.addProfile=async (req,res)=>{
    const filepath=req.file.filename;
    const userId=req.body.userId;
    try{
        const user=await UserModel.findById(userId);
        if(!user){
            return res.status(400).json({message:"User not found"});
        }else{
            user.profilePicture=filepath;
            await user.save();
            return res.status(200).json({message:"Profile picture added successfully",user});
        }
    }catch(error){
        return res.status(500).json({message:"Server error"});
    }
}

exports.posts = async (req, res) => {
  try {
    const userId = req.body.userId;
    const caption = req.body.caption;
    const filepath = req.file ? req.file.filename : "";

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const post = await PostModel.create({
      userId: userId,
      caption: caption,
      image: filepath,
    });

    return res.status(201).json({
      success: true,
      message: "Post Uploaded Successfully",
      post,
    });
  } catch (err) {
    console.error("Error uploading post:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .populate("userId", "username profilePicture") // ✅ fixed field name
      .populate("comments.userId", "username profilePicture")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// PUT /api/posts/:id/like
exports.likePost = async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await PostModel.findById(req.params.id);
    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
    } else {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    }
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/posts/:id/comment
exports.addComment = async (req, res) => {
  try {
    const { userId, text } = req.body;
    const post = await PostModel.findById(req.params.id);
    post.comments.push({ userId, text });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/users/follow
exports.followUser = async (req, res) => {
  try {
    const { userId, followId } = req.body;
    const user = await UserModel.findById(userId);
    const followUser = await UserModel.findById(followId);

    if (!user.following.includes(followId)) {
      user.following.push(followId);
      followUser.followers.push(userId);
      await user.save();
      await followUser.save();
    }

    res.json({ message: "Followed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/posts/:id/caption
exports.updateCaption = async (req, res) => {
  try {
    const { caption } = req.body;
    const post = await PostModel.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.userId.toString() !== req.body.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    post.caption = caption;
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/posts/:postId/comment/:commentId
exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId } = req.body;

    const post = await PostModel.findById(postId).populate("comments.userId", "username profilePicture");

    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Only comment owner can delete
    if (comment.userId._id.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    comment.deleteOne();
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadReel=async (req, res) => {
  try {
    const { userId, caption } = req.body;
    const newReel = new Reel({
      userId,
      caption,
      videoUrl: `${req.file.filename}`,
    });

    await newReel.save();
    res.json({ message: "Reel uploaded successfully!"});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
exports.getAllReels = async (req, res) => {
  try {
    const reels = await Reel.find()
      .populate("userId", "username profilePicture")
      .populate("comments.userId", "username profilePicture")
      .sort({ createdAt: -1 });
    res.json(reels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.likeReel = async (req, res) => {
  try {
    const { userId } = req.body;
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: "Reel not found" });
    if (reel.likes.includes(userId)) {
      // unlike
      reel.likes = reel.likes.filter((id) => id.toString() !== userId);
    } else {
      // like
      reel.likes.push(userId);
    }
    await reel.save();
    res.json({ message: "Updated likes", likes: reel.likes.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
exports.commentOnReel=async (req, res) => {
  try {
    const { userId, text } = req.body;
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: "Reel not found" });
    reel.comments.push({ userId, text });
    await reel.save();
    res.json({ message: "Comment added", comments: reel.comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.getMessages= async (req, res) => {
  const { userId, friendId } = req.params;
  const messages = await Message.find({
    $or: [
      { senderId: userId, receiverId: friendId },
      { senderId: friendId, receiverId: userId },
    ],
  }).sort({ createdAt: 1 });
  res.json(messages);
}

exports.fetchUser=async(req,res)=>{
  try {
    const user = await UserModel.findById(req.params.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "User not found" });
  }
}
exports.getFollowers = async (req, res) => {
  try {
    const userId = req.params.userId; // logged-in user id from route
    const user = await UserModel.findById(userId)
      .populate("followers", "username email profilePicture") // populate followers info
      .exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.followers);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};