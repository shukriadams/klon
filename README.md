What it is :
------------
Namespaces : Klon adds easy namespaces to javascript. Namespaces are handy for hierarchical organizing of code into classes.

Type injection : Once you have namespaces in place, Klon adds type injection so that different class can live at a namespace node. This is useful for loose coupling and injecting test stubs into your app.

Load what you need : Klon plays nice with Requirejs. You can build a large namespace of interdependent classes, but load types only as needed.

Klon isn't revolutionary. You can easily do these things with a little boilerplate, Klon just saves you a few lines of extra work so your code is nicer to look at.


Current status:
---------------
Klon is still in alpha - useable but subject to change should the need.


Bower:
------
Klon is available via bower as "klon".


How to use:
-----------
1) Klon has no direct dependencies, but for most realistic situations, organizing your classes in files demands an organized file loader like Requirejs.

    <script type='text/javascript' src='klon.js'></script>
    <script type='text/javascript' src='require.js'></script>

2) Create classes and hook them up to Klon with a namespace of your choosing. Klon assumes you want to work with classes in the "traditional" object oriented style.

Say we have a class with a method .doSomething(), which does some work. We have a production version which does real stuff. This class lives in its own file, production-script.js.

    (function(){

        var type = function(){ };
        type.prototype.doSomething = function(){
            return 'you made production!';
        };

        klon.register('foo.bar', type, 'production');   
    }());

We went to make a test stub of our worker class, which lives in its own file test-script.js. This also has a method .doSomething(), and is registered at the same namespace.

    (function(){
        var type = function(){ };
        type.prototype.doSomething = function(){
            return 'this was just a test';
        };

        klon.register('foo.bar', type, 'test'); 
    }());



3) In your app's config, hook things up at the start of your app with Require. Hook up production.

    // production flavor
    require.config({
        paths: {
            'klon': 'klon',
            'foobar': 'production.script',
        },
        shim : {
            'foobar' : ['klon'],
        }
    });


Or test.

    //or test flavor
    require.config({
        paths: {
            'klon': 'klon',
            'foobar': 'test.script',
        },
        shim : {
            'foobar' : ['klon'],
        }
    });


Or, both.

    // I want it all
    require.config({
        paths: {
            'klon': 'klon',
            'prod': 'production.script',
            'foobar': 'test.script',
        },
        shim : {
            'prod' : ['klon'],
            'foobar' : ['prod'],
        }
    });



4) Use your type without worrying about which class was hooked up.

    require(['foobar'], function(){
        var t = foo.bar.instance();	
        t.doSomething(); // if you set up for production, returns 'you made production!'
    });	



5) If you have multiple types bound at once, ask for one by name.

    require(['foobar'], function(){
        var t = foo.bar.instance('test');	
        t.doSomething(); // returns 'this was just a test'
    });	
