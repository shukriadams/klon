What it is :
------------
Namespaces : Klon adds easy namespaces to javascript. Namespaces are handy for organizing code into classes which can be reused between projects.

Type injection : Once you have namespaces in place, Klon adds type injection so that different class can live at a given node, keeping a common interface while performing different functions. This is useful for amongst other things, injecting test stubs into your app.

Load what you need : Klon plays nice with Require's loading model. You can build a large namespace of interdependent classes, but load types only as needed.

Klon isn't revolutionary. You can easily do these things with a little boilerplate, Klon just saves you a few lines of extra work.


Current status:
---------------
Current version is 0.0.3. Klon is still in alpha - it's mostly stable, but it could change.


Bower:
------
Klon is available via bower as "klon".


How to use it:
--------------
1) Scripts : Klon doesn't require Require.js, but it's nice to have it around.

    <script type='text/javascript' src='require.js'></script>
    <script type='text/javascript' src='klon.js'></script>



2) Create classes and hook them up to Klon with a namespace of your choosing. Klon assumes you want to work with classes in the traditional object oriented style.

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
        var t = foo.bar.instance();	
        t.doSomething(); // if you set up for production, returns 'you made production!'
    });	



5) If you have multiple types bound at once, ask for one by name.

    require(['foobar'], function(){
        var t = foo.bar.instance('test');	
        t.doSomething(); // returns 'this was just a test'
    });	
