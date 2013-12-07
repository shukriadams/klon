What it is :
------------
Klon adds namespaces and type injection to Require.js. This lets you keep your code relatively free of logic that handles type switching. Or if you want to use switching logic, Klon takes care of all the plumbing and lets you use a single string argument as switch.

Klon leans heavily on Require's loading model, so you load things only when needed. 

Klon doesn't do anything revolutionary. You can easily do the same thing by creating a custom factory for your types. All that Klon does is remove a lot of the boilerplating normally associated with factories.


How to use it:
------------
1) Scripts : Klon requires Requirejs.

    <script type='text/javascript' src='require.js'></script>
    <script type='text/javascript' src='klon.js'></script>



2) Create javascript classes, and hook them up to Klon with a namespace of your choosing. Klon assumes you want to work with classes in the traditional object oriented style.

Let's say we have a class with a method .doSomething(), which does some work. We have a production version which does real stuff. This class lives in its own file, production.script.js.

    (function(){

        var type = function(){ };
        type.prototype.doSomething = function(){
            return 'you made production!';
        };

        klon.register("foo.bar", type, 'production');   
    }());

We went to make a test stub of our worker class, which lives in its own file test.script.js. This also has a method .doSomething(), and is registered at the same namespace.

    (function(){
        var type = function(){ };
        type.prototype.doSomething = function(){
            return 'this was just a test';
        };

        klon.register('foo.bar', type, 'test'); 
    }());



3) Hook things up at the start of your app with Require. Hook up production, or test, or both.

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


    // test flavor
    require.config({
        paths: {
            'klon': 'klon',
            'foobar': 'test.script',
        },
        shim : {
            'foobar' : ['klon'],
        }
    });


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
        var t = foo.bar.create();	
        t.doSomething(); // if you set up for production, returns 'you made production!'
    });	



5) If you have multiple types bound at once, ask for one by name.

    require(['foobar'], function(){
        var t = foo.bar.create('test');	
        t.doSomething(); // returns 'this was just a test'
    });	
