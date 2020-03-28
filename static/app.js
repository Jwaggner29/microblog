const authorList = [];
const postList = [];
console.log("issa mircale");
Vue.component('post-component', {
    template: '<div class = "post"> <div class = "box"> <div class = "media-content"> <div class = "content"> <p> <strong> {{author.username}} </strong> <br> <small>{{post.body}} </small><br> </p> </div> </div> </div> </div>',
    props: {
        posts: Object,
        authors: Object
    }
});

new Vue({
    el: '#app',
    data: {
        authorList,
        postList,
    },
    created: function () {
        setInterval(() => {
            this.fetchUsers('http://localhost:3000/users');
            this.fetchPosts('http://localhost:3000/posts')

        }, 5000);
    },
    methods: {
        fetchUsers(uri) {
            axios.get(uri).then((res) => {
                this.authorList = res;
            })
        }
    }
});