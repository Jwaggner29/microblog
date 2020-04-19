var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var User = require('../models/user');

var PostSchema = new mongoose.Schema({
    author: {
        type: String
    },
    address: {
        type: String
    },
    university: {
        type: String
    },
    date: {
        type: String
    },
    attendees: {
        type: String
    }

});
const Posts = mongoose.model('Posts', PostSchema);
module.exports = Posts;