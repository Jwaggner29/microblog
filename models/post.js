var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var User = require('../models/user');

var PostSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserSchema'
    },
    address: {
        type: String
    },
    university: {
        type: String
    },
    atendees: {
        type: int
    }
    
});
const Posts = mongoose.model('Posts', PostSchema);
module.exports = Posts;