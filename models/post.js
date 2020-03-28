var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var User = require('../models/user');

var PostSchema = new mongoose.Schema({
    body: String,
    created: {
        type: Date,
        default: Date.now
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserSchema'
    }

});
const Posts = mongoose.model('Posts', PostSchema);
module.exports = Posts;