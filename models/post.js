const mongoose = require('mongoose');
const PostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    caption: {
        type: String,
        required: false,
        default: ""
    },
    image: {
        type: String,
        required: false,
        default: ""
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ],
    comments: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            },
            text: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
},
{ timestamps: true })
const PostModel = mongoose.model('post', PostSchema);
module.exports = PostModel;