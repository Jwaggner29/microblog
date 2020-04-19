var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Posts = require('../models/post');



// GET route for reading data
router.get('/', function (req, res, next) {
    //Doesn't allow relative path for some reason
    //Hardcoded for now
    console.log(__dirname);
    return res.sendFile(path.join(__dirname + '/static/index.html'))
    //return res.sendFile('C://Users/jwagg/Documents/microblogging/index.html');
    // return res.sendFile(path.join(__dirname + '/templateLogReg/index.html'));
});


//////
//POST route for updating data
router.post('/', function (req, res, next) {
    // confirm that user typed same password twice
    if (req.body.password !== req.body.passwordConf) {
        var err = new Error('Passwords do not match.');
        err.status = 400;
        res.send("passwords dont match");
        return next(err);
    }

    if (req.body.email &&
        req.body.username &&
        req.body.password &&
        req.body.passwordConf) {

        var userData = {
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
        }

        User.create(userData, function (error, user) {
            if (error) {
                return next(error);
            } else {
                req.session.userId = user._id;
                return res.redirect('/profile');
            }
        });

    } else if (req.body.logemail && req.body.logpassword) {
        User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
            if (error || !user) {
                var err = new Error('Wrong email or password.');
                err.status = 401;
                return next(err);
            } else {
                req.session.userId = user._id;
                return res.redirect('/profile');
            }
        });
    } else {
        var err = new Error('All fields required.');
        err.status = 400;
        return next(err);
    }
})

// GET route after registering
router.get('/profile', function (req, res, next) {
    User.findById(req.session.userId)
        .exec(function (error, user) {
            if (error) {
                return next(error);
            } else {
                if (user === null) {
                    var err = new Error('Not authorized! Go back!');
                    err.status = 400;
                    return next(err);
                } else {
                    console.log("Profile dir name : " + __dirname);
                    return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>' + '<br><a type="button" href="/feed">Go To Feed</a>');
                }
            }
        });
});

router.get('/feed', function (req, res, next) {
    var authorList = [];
    var postList = [];
    var htmlresponse = '<body style ="background-color: bisque;"> <form action="/feed" method="post"><input type="text" name="userPost" id="userPost" placeholder="Enter a post " required=""><br><div class="buttonTest"> <input type="submit" value="Submit Post"></div></form></body>';

    function done(authorList, postList) {
        var response = htmlresponse;

        for (var i = postList.length - 1; i >= 0; i--) {
            response += "<strong> " + authorList[i] + "</strong><br>";
            response += "<small>" + postList[i] + "</small><br><br>";
            console.log(authorList[i] + " : " + postList[i]);
            console.log(i);
        }
        response += '<br><a type="button" href="/logout">Logout</a>'
        return res.send(response);
    }
    if (!Posts) {
        return res.send(htmlresponse);
    } else {
        Posts.find({}, function (err, posts) {
            if (err) {
                return next(err);
            } else {
                posts.forEach(function (post, i) {
                    User.findById(post.author).exec(function (error, author) {
                        if (error) {
                            console.log("Hoping I don't ever see this");
                            return next(error);
                        } else {
                            authorList[i] = author.username;
                            postList[i] = post.body;
                        }
                        if (posts.length - 1 === i) {
                            done(authorList, postList);
                        }
                    });
                })
            }
        });
    }
});

router.post('/feed', function (req, res, next) {
    console.log('FEED POST SENT!');
    if (req.body.userPost) {
        console.log('inside if');
        var postData = {
            body: req.body.userPost,
            author: req.session.userId
        }

        Posts.create(postData, function (error, user) {
            if (error) {
                return next(error);
            } else {
                return res.redirect('/feed');
            }
        });
    }
});

// GET for logout logout
router.get('/logout', function (req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});

module.exports = router;