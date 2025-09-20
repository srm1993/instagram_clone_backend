const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const router = require('./routes/router');
const path=require('path')
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/Message");
mongoose.connect('mongodb+srv://soumyamahalik:kadali90@cluster0.a4jtujh.mongodb.net/socialMediaDB')
.then(()=>{
    console.log("Connected to MongoDB");
}).catch((err)=>{
    console.error("Error connecting to MongoDB",err);
});
app.use(cors({
    origin: 'https://instagram-clone-lemon-eta.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Socket.io setup
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});
let onlineUsers = {};
io.on("connection", (socket) => {
    console.log("⚡ User connected:", socket.id);

    // Join user
    socket.on("join", (userId) => {
        onlineUsers[userId] = socket.id;
        console.log("🟢 Online Users:", onlineUsers);
    });

    // Handle messages
    socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
        // Save in MongoDB
        const newMessage = new Message({ senderId, receiverId, text });
        await newMessage.save();

        // Emit to receiver if online
        const receiverSocketId = onlineUsers[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("receiveMessage", newMessage);
        }
    });

    // Disconnect
    socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
        Object.keys(onlineUsers).forEach((key) => {
            if (onlineUsers[key] === socket.id) {
                delete onlineUsers[key];
            }
        });
    });
});
app.use('/profiles', express.static(path.join(__dirname, 'profiles')));
app.use('/posts', express.static(path.join(__dirname, 'posts')));
app.use('/reels', express.static(path.join(__dirname, 'reels')));
app.use('/api',router);
const PORT =8000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});