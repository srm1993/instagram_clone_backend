const UserModel=require('../models/user');
const crypt=require('bcrypt');
const PostModel=require('../models/post');
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
