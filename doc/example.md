# Examples

## Quick Start

```js
// step 1: require 'lego-it'
var LEGO = require('lego-it');

// step 2: write your business codes
function getAuthor(params, callback) {
    // choose what you need from params. The params will be passed by you.
    var a = params.a;
    var b = params.b;
    var user = {
        a: a,
        b: b,
    };
    setImmediate(function() {
        callback(null, value);
    });
}

// step 3: define your lego function
var legoPost = LEGO.legoIt({
    createdAt: function(params, callback) {
        // callback the result. Do not support `return` or `promise`.
        callback(null, Date.now());
    },
    author: function(params, callback) {
        // params is the same object as above.
        getAuthor(params, callback);
    },
});

// step 4: the target object
var post = {
    postId: 0
};

// step 5: make your lego
legoPost({   // all properties will be passed to each function defined in step 3
    $target: post,
    $: {
        createdAt: LEGO.$.REQUIRED,
        author: LEGO.$.REQUIRED,
    },
    a: 1,
    b: 2,
}, function(err, post) {
    if (err) {
        console.error(err);
    } else {
        console.log(post);  // result like {createdAt: 1444745750701, author: {a: 1, b: 2}, postId: 0 }
    }
});

console.log(post);  // result like {createdAt: 1444745750701, author: {a: 1, b: 2}, postId: 0 }
```

## Advance Usages
continue with above codes:

### It only assigns value when its field are not `LEGO.$.OFF`
```js
// step 5: make your lego
legoPost({   // all properties will be passed to each function defined in step 3
    // $target: post,    // you can omit the $target, then the result is a new object
    $: {
        createdAt: LEGO.$.REQUIRED,
    },
    a: 1,
    b: 2,
}, function(err, post) {
    if (err) {
        console.error(err);
    } else {
        console.log(post);  // result like {createdAt: 1444745750701, postId: 0 }
    }
});
```


### Do not overwrite the source object

```js
// step 5: make your lego
legoPost({   // all properties will be passed to each function defined in step 3
    // $target: post,    // you can omit the $target, then the result is a new object
    $: {
        createdAt: LEGO.$.REQUIRED,
        author: LEGO.$.REQUIRED,
    },
    a: 1,
    b: 2,
}, function(err, post) {
    if (err) {
        console.error(err);
    } else {
        console.log(post);  // result like {createdAt: 1444745750701, author: {a: 1, b: 2}, postId: 0 }
    }
});
```

### You can change the `$target` to another, if you do not like the name.
```js
// step 3: define your lego function
var legoPost = LEGO.legoIt({
    target: 'post',      // the default value is '$target', now you change it to 'post'
}, {
    createdAt: function(params, callback) {
        // callback the result. Do not support `return` or `promise`.
        callback(null, Date.now());
    },
    author: function(params, callback) {
        // params is the same object as above.
        getAuthor(params, callback);
    },
});

// step 4: ...

// step 5: make your lego
legoPost({   // all properties will be passed to each function defined in step 3
    post: post,    // <----- look here
    $: {
        createdAt: LEGO.$.REQUIRED,
        author: LEGO.$.REQUIRED,
    },
    a: 1,
    b: 2,
}, function(err, post) {
    if (err) {
        console.error(err);
    } else {
        console.log(post);  // result like {createdAt: 1444745750701, author: {a: 1, b: 2}, postId: 0 }
    }
});
```

### Most things in LEGO are configurable and modifiable

