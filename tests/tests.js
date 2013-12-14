module("Klon tests", {
    setup: function () {
        var urlargs ="bust=" + (new Date()).getTime(); 
        require.config({
            //urlArgs: urlargs,
            paths: {
                'klon': '../klon',
                'search-google': 'searchGoogle',
                'search-lucene': 'luceneLook',
                'klone-child': 'klon.child',
                'keyless-type': 'keyless.type',
                'dependent': 'dependent',
                'dependonme': 'dependonme',
            },
            shim : {
                'klon-loader' : ['klon'],
                'search-google' : ['klon'],
                'search-lucene' : ['klon'],
                'klone-child' : ['klon'],
                'keyless-type' : ['klon'],
                'dependonme' : ['klon'],
                'dependent' : ['dependonme', 'klon'],
            }
        });

        require(['klon'], function(){
            klon.logging = true;
        });
    },

    teardown: function () {
        //alert("teardown");
        requirejs.undef();
    }
});



// credits for answer : http://stackoverflow.com/questions/950087/how-to-include-a-javascript-file-in-another-javascript-file
// todo : replace requirejs with this; modules loaded with require cannot be unloaded, preventing clean teardowns.
function loadScript(url, callback)
{
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}



test("Tests creating an instance with no registered types", function(){
    throws(function () {
            // create empty namespace fo.ba
            klon.register("fo.ba"); 
            var s = window.fo.ba.instance();
        },
        "No types registered at this namespace node"
    );    
});



test("Tests clearing a namespace node of all types", function(){
    throws(function () {
            var type = function(){ };
            type.prototype = function () { this.apply(this, arguments); };
            type.prototype.execute = function(){ };
            
            klon.register("foo.bar", type, "mytype");   
            foo.bar.cler();
            
            var s = window.foo.bar.instance();
        },
        "No types registered at this namespace node"
    );    
});



// tests "overload" behaviour of instance
test("tests creating an instance with no key but constructor with args", function(){
     // register first type
    var type = function(args){ 
        this.args = args;
    };
    type.prototype = function () { this.apply(this, arguments); };
    type.prototype.execute = function(){ return this.args.value; };

    klon.register("foo.bar", type, "mytype");   
    var instance = foo.bar.instance( { value : "test" });
    ok( instance.execute() === "test");
});



test("tests retrieving of type instead of instances", function(){
    // register first type
    var type = function(){  };
    type.prototype = function () { this.apply(this, arguments); };
    type.prototype.execute = function(){  return 1; };

    klon.register("foo.bar", type, "mytype");
    var retrievedType = foo.bar.type();
    var instance = new retrievedType();
    ok( instance.execute() === 1);
});



test( "tests registering items with the same key ", function() {
    
    // register first type
    var type1 = function(){  };
    type1.prototype = function () { this.apply(this, arguments); };
    type1.prototype.execute = function(){  return 1; };
    klon.register("foo.bar", type1, "mytype");

    // register type 2 on same key
    var type2 = function(){ };
    type2.prototype = function () { this.apply(this, arguments); };
    type2.prototype.execute = function(){ return 2; };
    klon.register("foo.bar", type2, "mytype");

    // test
    var instance = window.foo.bar.instance("mytype");
    ok( instance.execute() === 2);
});



asyncTest("Tests a module that has an internal dependency on a klon namespae", function () {

    require(['dependent'], function(){
        start();

        var s = window.schmoo.beer.instance();
        var result = s.execute();
        ok(result === "some work");
    });

});



/*
Test fails if run with other tests. Needs proper teardown.
*/
asyncTest("Tests registering of type without a key", function () {

    require(['keyless-type'], function(){
        start();

        var s = window.foo.bar.instance();
        var result = s.execute();
        ok(result === 1);

    });

});



asyncTest("Tests adding an item to klon's own namespace", function () {

    require(['klone-child'], function(){
        start();

        var s = window.klon.child.instance();
        var result = s.execute();
        ok(result === "cube");

    });

});



/*
Test fails if run with other tests. Needs proper teardown.
*/
asyncTest("Instantiates default module", function () {

    require(['search-google'], function(){
        start();

        var s = window.foo.bar.instance();
        var result = s.execute();
        ok(result === "google results");

    });

});



asyncTest("Instantiates a named module", function () {

    require(['search-google'], function(){
        start();

        var s = window.foo.bar.instance('google');
        var result = s.execute();
        ok(result === "google results");

    });

});



asyncTest("Instantiates a named module when modules registered at same namespace node", function () {

    require(['search-google', 'search-lucene'], function(){
        start();

        var s = window.foo.bar.instance('lucene');
        var result = s.execute();
        ok(result === "lucene results");
    });

});



asyncTest("Instantiates two named modules from same namespace node", function () {

    require(['search-google', 'search-lucene'], function(){
        start();

        var s = window.foo.bar.instance('lucene');
        var result = s.execute();
        ok(result === "lucene results");

        s = window.foo.bar.instance('google');       
        var result = s.execute();
        ok(result === "google results");

    });

});
