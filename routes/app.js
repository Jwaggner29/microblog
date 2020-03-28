var User = require('../models/user');
var Posts = require('../models/post')
var authorList = [];
var postList = [];
console.log("issa mircale");
Vue.component('post-component', {
    template: '<div class = "post"> <div class = "box"> <div class = "media-content"> <div class = "content"> <p> <strong> {{author.username}} </strong> <br> <small>{{post.body}} </small><br> </p> </div> </div> </div> </div>',
    props: {
        posts: Object,
        authors: Object
    }
});


/*
Posts.find({}, (err, post) => {
    if (err) {
        return next(error);
    } else {
        for (var body in post) {
            postList[counter] = post[body].body;
            document.getElementById('').innerHTML += postList[counter];
            User.findById(post[body].author).exec(function (error, user) {
                var acounter = 0;
                if (error) {
                    return next(error);
                } else {
                    if (user === null) {
                        var err = new Error("UserID not found.");
                        err.status = 400;
                        return next(err);
                    } else {
                        authorName = user.username;

                    }
                }
                acounter = acounter + 1;
                authorList[acounter] = authorName;
            });
            counter = counter + 1;

        }
    }
});
*/
new Vue({
    el: '#app',
    data: {
        authorList,
        postList,
    }
});