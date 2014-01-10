module("Klon tests", {
    setup: function () {
        require.config({
            paths: {
                'klon': '../klon',
                'search-google': 'searchGoogle',
                'search-lucene': 'luceneLook',
                'klone-child': 'klon.child',
                'keyless-type': 'keyless.type',
                'dependent': 'dependent',
                'dependonme': 'dependonme'
            },
            shim : {
                'klon-loader' : ['klon'],
                'search-google' : ['klon'],
                'search-lucene' : ['klon'],
                'klone-child' : ['klon'],
                'keyless-type' : ['klon'],
                'dependonme' : ['klon'],
                'dependent' : ['dependonme', 'klon']
            }
        });

        require(['klon'], function(){
            klon.logging = true;
        });
    },

    teardown: function () {
        requirejs.undef();
    }
});


// ===========================================================================
// credits for answer : http://stackoverflow.com/questions/950087/how-to-include-a-javascript-file-in-another-javascript-file
// todo : replace requirejs with this; modules loaded with require cannot be unloaded, preventing clean teardowns.
// ---------------------------------------------------------------------------
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

test("simple protoype inheritence test", function(){

    // create a base type, register it with a fixed key
    var Base = function(){
        this.name = "";
    };
    Base.prototype.Say = function(){ return this.name; };
    klon.register("fool.bear", "Base", Base);

    // make sure it works
    var base = new window.fool.bear.Base();
    base.name = "123";
    ok(base.Say() ==="123");

    //override it from its fixed key, store without key
    var Override1 = new function(){};
    Override1.prototype = new window.fool.bear.Base()
    Override1.prototype.constructor = Override1;
    klon.register("fool.bear", Override1);

    // ensure the override works
    var override1 = window.fool.bear.instance();
    override1.name= "321";
    ok(override1.Say() ==="321");

    //override the base again, store without key
    var Override2 = new function(){};
    Override2.prototype = new window.fool.bear.Base()
    Override2.prototype.constructor = Override2;
    klon.register("fool.bear", Base);

    // ensure the new override also works
    var override2 = window.fool.bear.instance();
    override2.name= "321";
    ok(override2.Say() ==="321");

    // 

});

// ===========================================================================
// Checks klon.is() utility function.
// ---------------------------------------------------------------------------
test("tests falsey checking", function(){

    var test = function(variable){
        return klon.is(variable);
    }

    ok(test(undefined) === false);
    ok(test(null) === false);
    ok(test() === false);

    ok(test(0) === true);
    ok(test("") === true);
    ok(test(false) === true);
});


// ===========================================================================
//
// ---------------------------------------------------------------------------
test("Tests creating an instance with no registered types", function(){
    try
    {
        var type = function(){ };
        type.prototype.execute = function(){ };
        
        klon.register("foo.bar", "mytype", type);   
        foo.bar.clear();
        
        var s = window.foo.bar.instance();
        
    }
    catch(err)
    {
        ok (err && err.indexOf("Did not find a registered type") === 0);
    }   
});


// ===========================================================================
//
// ---------------------------------------------------------------------------
test("Tests clearing a namespace node of all types", function(){
    throws(function () {
            var type = function(){ };
            type.prototype.execute = function(){ };
            
            klon.register("foo.bar", "mytype", type);   
            foo.bar.cler();
            
            var s = window.foo.bar.instance();
        },
        "No types registered at this namespace node"
    );    
});


// ===========================================================================
//
// ---------------------------------------------------------------------------
test("test function that tests if namespace exists", function(){
    
    // empty namespace
    klon.register("foo.bar");   
    ok(klon.exists("foo.bar"));

    // namespace with type
    var type = function(){ };
    type.prototype.execute = function(){ return 1; };

    klon.register("foo2.bar2", "mytype", type);   
    ok(klon.exists("foo2.bar2"));

    // invalid namespace
    ok(!klon.exists("foo3.bar3"));

    // manually created namespace
    window.fooshizzle = {};
    window.fooshizzle.nizzle = {};
    ok(!klon.exists("fooshizzle.nizzle"));    
});


// ===========================================================================
//
// ---------------------------------------------------------------------------
test("tests instantiation of a type directly from namespace", function(){

     // register first type
    var type = function(){ };
    type.prototype.execute = function(){ return 1; };

    klon.register("foo.bar", "mytype", type);   
    var instance = new foo.bar.mytype();
    ok( instance.execute() === 1);
});


// ===========================================================================
// tests "overload" behaviour of instance
// ---------------------------------------------------------------------------
test("tests creating an instance with no key but constructor with args", function(){
     // register first type
    var type = function(args){ 
        this.args = args;
    };
    type.prototype = function () { this.apply(this, arguments); };
    type.prototype.execute = function(){ return this.args.value; };

    klon.register("foo.bar", "mytype", type);   
    var instance = foo.bar.instance( { value : "test" });
    ok( instance.execute() === "test");
});


// ===========================================================================
//
// ---------------------------------------------------------------------------
test("tests retrieving of type instead of instances", function(){
    // register first type
    var type = function(){  };
    type.prototype.execute = function(){  return 1; };

    klon.register("foo.bar", "mytype", type);
    var retrievedType = foo.bar.type();
    var instance = new retrievedType();
    ok( instance.execute() === 1);
});


// ===========================================================================
//
// ---------------------------------------------------------------------------
test( "tests registering items with the same key ", function() {
    
    // register first type
    var type1 = function(){  };
    type1.prototype.execute = function(){  return 1; };
    klon.register("foo.bar", "mytype", type1);

    // register type 2 on same key
    var type2 = function(){ };
    type2.prototype.execute = function(){ return 2; };
    klon.register("foo.bar", "mytype", type2);

    // test
    var instance = window.foo.bar.instance("mytype");
    ok( instance.execute() === 2);
});


// ===========================================================================
//
// ---------------------------------------------------------------------------
test("tests clearing of types", function() {
    // register first type
    var type1 = function(){  };
    type1.prototype.execute = function(){  return 1; };
    klon.register("foo.bar", "mytype", type1);

    // register type 2 on same key
    var type2 = function(){ };
    type2.prototype.execute = function(){ return 2; };
    klon.register("foo.bar", "mytype2", type2);

    ok(foo.bar.hasOwnProperty("mytype"));
    ok(foo.bar.hasOwnProperty("mytype2"));

    // clear
    window.foo.bar.clear();

    // test
    ok(!foo.bar.hasOwnProperty("mytype"));
    ok(!foo.bar.hasOwnProperty("mytype2"));
});


// ===========================================================================
//
// ---------------------------------------------------------------------------
test("Tests adding namespace to global object other than window", function () {

    var root = {};

    var type = function(){  };
    type.prototype.do = function(){ return 1; };
    klon.register(root, "foo.bar", type);

    var instance = root.foo.bar.instance();
    ok(instance.do() === 1);
});


// ===========================================================================
//
// ---------------------------------------------------------------------------
asyncTest("Tests a module that has an internal dependency on a klon namespace", function () {

    require(['dependent'], function(){
        start();

        var s = window.schmoo.beer.instance();
        var result = s.execute();
        ok(result === "some work");
    });

});


// ===========================================================================
// Test fails if run with other tests. Needs proper teardown.
// ---------------------------------------------------------------------------
asyncTest("Tests registering of type without a key", function () {

    require(['keyless-type'], function(){
        start();

        var s = window.foo.bar.instance();
        var result = s.execute();
        ok(result === 1);

    });

});


// ===========================================================================
//
// ---------------------------------------------------------------------------
asyncTest("Tests adding an item to klon's own namespace", function () {

    require(['klone-child'], function(){
        start();

        var s = window.klon.child.instance();
        var result = s.execute();
        ok(result === "cube");

    });

});


// ===========================================================================
// Test fails if run with other tests. Needs proper teardown.
// ---------------------------------------------------------------------------
asyncTest("Instantiates default module", function () {

    require(['search-google'], function(){
        start();

        var s = window.foo.bar.instance();
        var result = s.execute();
        ok(result === "google results");

    });

});


// ===========================================================================
//
// ---------------------------------------------------------------------------
asyncTest("Instantiates a named module", function () {

    require(['search-google'], function(){
        start();

        var s = window.foo.bar.instance('google');
        var result = s.execute();
        ok(result === "google results");

    });

});


// ===========================================================================
//
// ---------------------------------------------------------------------------
asyncTest("Instantiates a named module when modules registered at same namespace node", function () {

    require(['search-google', 'search-lucene'], function(){
        start();

        var s = window.foo.bar.instance('lucene');
        var result = s.execute();
        ok(result === "lucene results");
    });

});


// ===========================================================================
//
// ---------------------------------------------------------------------------
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