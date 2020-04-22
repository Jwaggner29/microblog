var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Posts = require('../models/post');



// GET route for reading data
router.get('/', function (req, res, next) {
    
    console.log(__dirname);
    return res.sendFile(path.join(__dirname + '/static/index.html'))
    
});


//POST route for login 
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
            dln: req.body.dln,
            attending: "0"
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
                    return res.send('<html><br><a type="button" href="/feed" style = "float:right;margin-right: 5px;">View Feed</a>  <a type="button" href="/logout" style = "margin-right: 5px;float:right;"> Logout</a> <div class = "container"><div class = "profileContainer" style = "right:50%;content-align:center; text-align:center;"><h2>Logged in as :  </strong>' + user.username + '</strong> </div> </div> <p> Welcome to Gatherings for Students!</p><br> <p> Our mission is to allow students to find or create social gatherings in their area.</p><br><p>Each gathering posted is provided with a host name, a university, address, and date.</p><br><p> At the top right, there is a link to another page to get started!</p><body style = "background-image: url(cityscape3.jpg);background-repeat:no-repeat;background-attachment:fixed;"> ');
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
                    let pageString = '<a type="button" href="/profile" style = "float:right;margin-right: 5px;">Profile</a>  <a type="button" href="/logout" style = "margin-right: 5px;float:right;">Logout</a><strong style="font-size:32px; margin-top:0px;">Host a Gathering!</strong><br><div class="SearchBar" style="float:right;"><form id="createPost" action="/search/" method="post" onsubmit="validateUniversityName();"><textarea name="universityPost" id="universityPost" rows = "1" cols = "50" placeholder="Search for gatherings by University Name " onkeyup="this.value = this.value.toUpperCase();" required=""></textarea><br><input type="submit" value="Search This University"></form></div><body style = "background-image: url(cityscape2.jpg);background-repeat:no-repeat;background-attachment:fixed;"> <form id="createPost" action="/feed" method="post" onsubmit="validateUniversityName();"><textarea name="universityPost" id="universityPost" rows = "2" cols = "30" placeholder="Enter university name " onkeyup="this.value = this.value.toUpperCase();"required=""></textarea><textarea name="addressPost" id="addressPost" rows = "2" cols = "30" placeholder="Enter address" required=""></textarea><textarea name="datePost" id="datePost" rows = "2" cols = "30" placeholder="Enter date" required=""></textarea><br><div class="buttonTest"> <input type="submit" value="Submit Post"></div></form></body>';
                    Posts.find({}).exec(function (err, posts) {
                        //Iterates backwards to show most recent posts first
                        for (let i = posts.length - 1; i >= 0; i--) {
                            pageString += '<div class="ThePost" style=" width: 45%;"><div class="boder" style="outline : 3px solid grey; text-align: left;"><small> Host : ' + posts[i].author + '</small><br><br><strong> Date : ' + posts[i].date + '</strong><br><br><strong> University : ' + posts[i].university + '</strong><br><br><strong> Address : ' + posts[i].address + '</strong><br><br><strong> Attending : ' + posts[i].attendees + '</strong><br></div><br><br></div>';
                        }
                        pageString += '<script type="text/javascript"> var uniName = document.getElementById("universityPost");var form = document.getElementById("createPost");function validateUniversityName() {if (uniName.indexOf(" ") >= 0) {alert("University Name may NOT contain spaces.");} else {form.submit();}}</script>';
                        pageString += '';

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
                        address: req.body.addressPost,
                        university: req.body.universityPost,
                        date: req.body.datePost,
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
router.post('/search', function (req, res, next) {
    return res.redirect('/search/' + req.body.universityPost);
});
router.get('/search/:university', function (req, res, next) {
    Posts.find({
        university: req.params.university
    }, function (err, posts) {
        if (err) {
            return next(error);
        }
        let pageString = '<a type="button" href="/feed" style = "float:right;margin-right: 10px;">Back To Feed</a><a type="button" href="/profile" style = "float:right;margin-right: 5px;">Profile</a>  <a type="button" href="/logout" style = "margin-right: 5px;float:right;">Logout</a><strong style="font-size:32px; margin-top:0px;">Host a Gathering!</strong><br><div class="SearchBar" style="float:right;"><form id="createPost" action="/search/" method="post" onsubmit="validateUniversityName();"><textarea name="universityPost" id="universityPost" rows = "1" cols = "50" placeholder="Search for gatherings by University Name "onkeyup="this.value = this.value.toUpperCase();" required=""></textarea><br><input type="submit" value="Search This University"></form></div><body style = "background-image: url(/cityscape2.jpg);background-repeat:no-repeat;background-attachment:fixed;"> </body>';
        //let pageString = '<br><a type="button" href="/feed" style = "float:right;margin-right: 10px;">Back To Feed</a> <a type="button" href="/profile" style = "float:right;margin-right: 10px;">Profile</a>  <a type="button" href="/logout" style = "margin-right: 10px;float:right;">Logout</a><br><strong>Host a Party!</strong><body style = "background-image: url(/cityscape2.jpg);background-repeat:no-repeat;background-attachment:fixed;"> </div></form></body>';
        for (let i = posts.length - 1; i >= 0; i--) {
            pageString += '<div class="ThePost" style=" width: 45%;"><div class="boder" style="outline : 3px solid grey; text-align: left;"><small> Host : ' + posts[i].author + '</small><br><br><strong> Date : ' + posts[i].date + '</strong><br><br><strong> University : ' + posts[i].university + '</strong><br><br><strong> Address : ' + posts[i].address + '</strong><br><br><strong> Attending : ' + posts[i].attendees + '</strong><br></div><br><br></div>';
        }
        pageString += '<script type="text/javascript"> var uniName = document.getElementById("universityPost");var form = document.getElementById("createPost");function validateUniversityName() {if (uniName.indexOf(" ") >= 0) {alert("University Name may NOT contain spaces.");} else {form.submit();}}</script>';
        return res.send(pageString);
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