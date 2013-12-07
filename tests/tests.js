module("Klon tests", {
    setup: function () {
        var urlargs ="bust=" + (new Date()).getTime(); 
        require.config({
            //urlArgs: urlargs,
            paths: {
                'klon': '../core/klon',
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

test("Tests creating an instance with no registered types", function(){
    throws(function () {
            // create empty namespace fo.ba
            klon.register("fo.ba"); 
            var s = window.fo.ba.instance();
        },
        "No types registered at this namespace node"
    );    
});


asyncTest("Tests a module that has an internal dependency on a klon namespae", function () {

    require(['dependent'], function(){
        start();

        var s = window.schmoo.beer.instance();
        var result = s.execute();
        ok(result === "some work", "worker worked");
    });

});


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

asyncTest("Instantiates default module", function () {

    require(['search-google'], function(){
        start();

        var s = window.foo.bar.instance();
        var result = s.execute();
        ok(result === "google results", "google says yay!");

    });

});

asyncTest("Instantiates a named module", function () {

    require(['search-google'], function(){
        start();

        var s = window.foo.bar.instance('google');
        var result = s.execute();
        ok(result === "google results", "google says yay!");

    });

});

asyncTest("Instantiates a named module when modules registered at same namespace node", function () {

    require(['search-google', 'search-lucene'], function(){
        start();

        var s = window.foo.bar.instance('lucene');
        var result = s.execute();
        ok(result === "lucene results", "lucene says yay!");
    });

});


asyncTest("Instantiates two named modules from same namespace node", function () {

    require(['search-google', 'search-lucene'], function(){
        start();

        var s = window.foo.bar.instance('lucene');
        var result = s.execute();
        ok(result === "lucene results", "lucene says yay!");

        s = window.foo.bar.instance('google');       
        var result = s.execute();
        ok(result === "google results", "google still says yay!");

    });

});