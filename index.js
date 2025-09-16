const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const router = require('./routes/router');
const path=require('path')
mongoose.connect('mongodb://localhost:27017/socialMediaDB')
.then(()=>{
    console.log("Connected to MongoDB");
}).catch((err)=>{
    console.error("Error connecting to MongoDB",err);
});
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/profiles', express.static(path.join(__dirname, 'profiles')));
app.use('/posts', express.static(path.join(__dirname, 'posts')));
app.use('/api',router);
const PORT =8000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});