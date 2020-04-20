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
        req.body.passwordConf &&
        req.body.dln) {

        var userData = {
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            dln: req.body.dln
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
                    return res.send('<html><br><a type="button" href="/feed" style = "float:right;margin-right: 5px;">View Feed</a>  <a type="button" href="/logout" style = "margin-right: 5px;float:right;"> Logout</a> <div class = "container"><div class = "profileContainer" style = "right:50%;content-align:center; text-align:center;"><h2>Logged in as :  </strong>' + user.username + '</strong> </div> </div> ');
                }
            }
        });
});
router.get('/feed', function (req, res, next) {
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
                    let pageString = '<br><a type="button" href="/profile" style = "float:right;margin-right: 5px;">Profile</a>  <a type="button" href="/logout" style = "margin-right: 5px;float:right;">Logout</a><br><strong>Host a Party!</strong><body style = "background-image: url(cityscape2.jpg);"> <form action="/feed" method="post"><textarea name="universityPost" id="universityPost" rows = "2" cols = "30" placeholder="Enter university name " required=""></textarea><textarea name="addressPost" id="addressPost" rows = "2" cols = "30" placeholder="Enter address" required=""></textarea><textarea name="datePost" id="datePost" rows = "2" cols = "30" placeholder="Enter date" required=""></textarea><br><div class="buttonTest"> <input type="submit" value="Submit Post"></div></form></body>';
                    Posts.find({}).exec(function (err, posts) {
                        for (var i in posts) {
                            pageString += '<div class="ThePost" style=" width: 45%;"><div class="boder" style="outline : 3px solid grey; text-align: left;"><small> Host : ' + posts[i].author + '</small><br><br><strong> Date : ' + posts[i].date + '</strong><br><br><strong> University : ' + posts[i].university + '</strong><br><br><strong> Address : ' + posts[i].address + '</strong><br><br><strong> Attending : ' + posts[i].attendees + '</strong><br></div><br><br></div>';
                        }
                        return res.send(pageString);
                    });
                }
            }
        });
});

router.post('/feed', function (req, res, next) {
    User.findById(req.session.userId)
        .exec(function (error, user) {
            if (error) {
                return next(error);
            } else {
                if (user === null) {
                    var err = new Error('Not authorized. Please go back.');
                    err.status = 404;
                    return next(err);
                } else {
                    console.log(req.body.post);
                    console.log(user.username);
                    var postData = {
                        author: user.username,
                        //TEMP CHANGE LATER
                        address: req.body.addressPost,
                        university: req.body.universityPost,
                        date: req.body.datePost,
                        //address: "2779 Bedford Street",
                        //university: "University of Pittsburgh at Johnstown",
                        attendees: "0",
                    }
                    Posts.create(postData, function (error, posted) {
                        if (error) {
                            return next(error);
                        } else {
                            return res.redirect('/feed');
                        }
                    });

                }
            }
        });
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