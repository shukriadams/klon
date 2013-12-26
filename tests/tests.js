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


// ===========================================================================
//
// ---------------------------------------------------------------------------
test("tests multilevel inheritence with functions", function(){
    var Base = function(){ };
    Base.prototype.do = function(){ return "1"; };

    var Level1 = function(){ };
    Level1 = klon.extend(Level1, Base, {
        do : function(){ return this.base.do() + "2"; }
    });

    var Level2 = function(){ };
    Level2 = klon.extend(Level2, Level1, {
        do : function(){ return this.base.do() + "3"; }
    });

    var level2 = new Level2();
    var out = level2.do();
    ok(out === "123");
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
test("tests multilevel inheritence with multiple functions", function(){
    var Base = function(){ };
    Base.prototype.do = function(){ return "1"; };
    Base.prototype.undo = function(){ return "3"; };

    var Level1 = function(){ };
    Level1 = klon.extend(Level1, Base, {
        do : function(){ return this.base.do() + "2"; },
        undo : function(){ return this.base.undo() + "2"; }
    });

    var Level2 = function(){ };
    Level2 = klon.extend(Level2, Level1, {
        do : function(){ return this.base.do() + "3"; },
        undo : function(){ return this.base.undo() + "1"; }
    });

    var level2 = new Level2();
    var out = level2.do();
    var out2 = level2.undo();
    ok(out === "123");
    ok(out2 === "321");
});


// ===========================================================================
//
// ---------------------------------------------------------------------------
test("tests multilevel inheritence with properties - simple", function(){
    var Base = function(){ };
    Base.prototype.text = "abc";

    var Level1 = function(){ };
    Level1 = klon.extend(Level1, Base, {
    });

    var level1 = new Level1();
    var out = level1.text;
    ok(out === "abc");
});


// ===========================================================================
//
// ---------------------------------------------------------------------------
test("tests persistent property value throughout inheritence stack", function(){
    var Base = function(){ };
    Base.prototype = function () { this.apply(this, arguments); };
    Base.prototype.text = "abc";
    Base.prototype.passup = function(){
        return this.text;
    };

    var Level1 = function(){ };
    klon.extend(Level1, Base, {
        passup : function(){
            return this.text + this.base.passup();
        }
    });

    for (var prop in level1) {
        var test = source[prop];
    }

    var level1 = new Level1();
    level1.text = "edf";

    var base = new Base();
    for (var prop in base) {
        var test = base[prop];
        var test2 = test;
    }

    var out = level1.passup();
    ok(out === "edfedf");
});


// ===========================================================================
//
// ---------------------------------------------------------------------------
test("tests multilevel inheritence with properties - complex", function(){
    var Base = function(){ };
    Base.prototype = function () { this.apply(this, arguments); };
    Base.prototype.do = function(){ 
        var t = this.text + "b"; 
        return t;
    };
    Base.prototype.text = "a";

    var Level1 = function(){ };
    Level1.prototype = function () { this.apply(this, arguments); };
    Level1 = klon.extend(Level1, Base, {
        do : function(){ 
            var t = this.base.do() + this.base.text;
            return t;
        }
    });

    var Level2 = function(){ };
    Level2.prototype = function () { this.apply(this, arguments); };
    Level2 = klon.extend(Level2, Level1, {
        do : function(){ 
            var t = this.base.do() + this.base.text + this.text;
            return t;
        },
        text : "c"

    });

    var level2 = new Level2();
    level2.do();
    var out = level2.do();
    ok(out === "abaac");
});


// ===========================================================================
//
// ---------------------------------------------------------------------------
test("Tests creating an instance with no registered types", function(){
    try
    {
        var type = function(){ };
        type.prototype.execute = function(){ };
        
        klon.register("foo.bar", type, "mytype");   
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
            
            klon.register("foo.bar", type, "mytype");   
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

    klon.register("foo2.bar2", type, "mytype");   
    ok(klon.exists("foo2.bar2"));

    // invalid namespace
    ok(!klon.exists("foo3.bar3"));
});


// ===========================================================================
//
// ---------------------------------------------------------------------------
test("tests instantiation of a type directly from namespace", function(){

     // register first type
    var type = function(){ };
    type.prototype.execute = function(){ return 1; };

    klon.register("foo.bar", type, "mytype");   
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

    klon.register("foo.bar", type, "mytype");   
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

    klon.register("foo.bar", type, "mytype");
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
    klon.register("foo.bar", type1, "mytype");

    // register type 2 on same key
    var type2 = function(){ };
    type2.prototype.execute = function(){ return 2; };
    klon.register("foo.bar", type2, "mytype");

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
    klon.register("foo.bar", type1, "mytype");

    // register type 2 on same key
    var type2 = function(){ };
    type2.prototype.execute = function(){ return 2; };
    klon.register("foo.bar", type2, "mytype2");

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
asyncTest("Tests a module that has an internal dependency on a klon namespae", function () {

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