/*
    Klon is a javascript library for creating and working with namespaces, inheritance 
    and loose coupling in a more traditional object oriented way. It has no dependencies.
    
    Use klon to create a global namespace like window.my.long.foo.bar.namespace from 
    the string "window.my.long.foo.bar.namespace". Klon will also attach a function

        var mytype = function(){}; 

    to that namespace, giving you 
        window.my.long.foo.bar.namespace.myType;
    

    Klon lets you affix multiple types to one namespace, or overwrite an existing type.
        var myInstance = new window.my.long.foo.bar.namespace.myType();
        var myOtherInstance = new window.my.long.foo.bar.namespace.myOtherType();


    Klon also lets you create an instance without knowing the type
        var myInstance = window.my.long.foo.bar.namespace.instance();

    In this way it allows you to achieve some degree of loose coupling, as you can bind
    different types with the same interface to a predetermined namespace, and then get
    an instance back without having to know which concrete type you're getting.

    
    Klon also adds Underscore-style extend(), but with an added .base member to type instances,
    allowing you to call all overridden methods regardless of how deep the inheritance chain.
    this.base.base.base. etc calls also work, with a .base available for each override level.


    Author : Shukri Adams (shukri.adams@gmail.com), 2013
    Klon is available under the MIT license and can be freely distributed.

    http://github.com/shukriadams/klon

    Some parts of Klon are taken from Underscorejs, written by Jeremy Ashkenas (http://underscorejs.org)
*/

// this is the only global variable klon uses.
var klon;

(function(){
    
    // had to remove to use "arguments" :(
    //'use strict';


    // setup global if it doesn't exist, else state will be reset each time script is read    
    if (klon == null){
        klon = {};
        klon.root = window;     // klon needs a global object to attach namespaces to. This can be override if needed.
        klon.logging = false;   // true if klon should go verbose. For development.
    }


    // names of functions klon attaches to namespaces.
    var functionNames = ["instance", "type", "clear"];


    // utility function : returns true if a namespace/type exists
    klon.exists = function(ns){
        var nodes = ns.split('.');
        var root = klon.root;
        
        if (root === null){
            return false;
        }

        for (var i = 0 ; i < nodes.length ; i ++){
            var node = nodes[i];

            if (!root.hasOwnProperty(node)){
                return false;
            }

            root = root[node];
        }
        return true;
    };


    // utility function : returns true if variable is neither undefined nor null
    klon.is = function(variable){
        if (typeof(variable) === 'undefined' || variable === null)
            return false;
        return true;
    };


    // WARNING : does not work for property state in overridden classes. Use at own risk. If 
    // this cannot be fixed, method will be removed.
    // Lets a type inherit from another type. Base methods are preserved with an infinite level
    // of inheritance supported. Use this.base.myMethod() to call base method.
    // Code is taken entirely from Underscore.js (without official authorization
    // or permission). Addition of .base by me.
    // Credit (and appreciation) to Jeremy Ashkenas http://underscorejs.org
    // Use : newType = klon.extend(newType, baseType, { functions });
    klon.extend = function(type){
        if (!type){
            throw 'Missing type to extend to.';
        }

        var obj = type.prototype;

        var ArrayProto = Array.prototype;
        var slice = ArrayProto.slice;      
        var nativeForEach = ArrayProto.forEach;

        var each = function(obj, iterator, context) {
            if (obj == null) return;
            if (nativeForEach && obj.forEach === nativeForEach) {
                obj.forEach(iterator, context);
            } else if (obj.length === +obj.length) {
                for (var i = 0, length = obj.length; i < length; i++) {
                    if (iterator.call(context, obj[i], i, obj) === breaker) return;
                }
            } else {
                var keys = _.keys(obj);
                for (var i = 0, length = keys.length; i < length; i++) {
                    if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
                }
            }
        };

        each(slice.call(arguments, 1), function(source) {
            
            if (source) {
                var sourceIsFunction = source.toString().indexOf("function") === 0;
    
                if (sourceIsFunction)
                {
                    obj.base = obj.base || source.prototype;
                
                
                    // this fixes properties getting left behind while function are carried forward to overriding types
                    if (obj.base){
                        for (var prop in obj.base) {
                            if (prop === "constructor" || prop === "__proto__" || obj.hasOwnProperty(prop)){
                                continue;
                            }
                            // do not transfer functions.
                            if (obj.base[prop].toString().indexOf("function") === 0)
                                continue;

                            obj[prop] = obj.base[prop];
                        }
                    }
                }
                
                for (var prop in source) {
                    obj[prop] = source[prop];
                }
            }
        });

        return type;
    };


    // gets an instance
    // add optional interface as part of registration contract
    klon.register = function () { /*ns, type, key*/ 
        var ns, type, key, rt;
        var args = Array.prototype.slice.call(arguments, 0);

        while(args.length > 0){
            var test = typeof args[0];
            if (!klon.is(rt) && typeof args[0] === 'object'){
                rt = args[0]; args.splice(0, 1);
                continue;
            }
            if (!klon.is(ns) && typeof args[0] === 'string'){
                ns = args[0]; args.splice(0, 1);
                continue;
            }
            if (!klon.is(key) && typeof args[0] === 'string'){
                key = args[0]; args.splice(0, 1);
                continue;
            }
            if (args.length === 1){
                type = args[0]; args.splice(0, 1);
                break;
            } 
            args.splice(0, 1);           
        }
        
        rt = rt || klon.root;


        // setup up and/or get namespace 
        var namespace = klon.namespace(ns, rt);


        // Attach "instance" method which returns an instance of the type 
        // with the requested key, or the first type at the node if no key
        // given.
        // key : unique key type was registerd with
        // args : optional constructor args for instance.
        if (!namespace.instance){
            namespace.instance = function instance (key, args){
                // "overload"
                if (!args && typeof key === 'object' ){
                    args = key;
                    key = null;
                }

                return get(namespace, key, args, true);
            }; 
        }

            
        // Attach "type" method which returns the type (class) with the requested
        // key, or the first type at the node if no key is given.
        if (!namespace.type){
            namespace.type = function type(key){
                return get(namespace, key, null, false);
            }
        }

        

        // clears all types at the node.
        if (!namespace.clear){
            namespace.clear = function clear(){
                for (var property in namespace) {
                    if (!namespace.hasOwnProperty(property)) {
                        continue;
                    }
                    
                    if(!!~functionNames.indexOf(property)){
                        continue;
                    }

                    delete namespace[property];
                }                
            }
        }        


        // attach property to namespace, either at key, use name "default"
        if (type){
            if (!key){
                key = "default";
            }

            namespace[key] = type;

            klon.log('registered type at namespace ' + ns + (key?' '+key:'') );
        }

    };


    // gets an instance or raw type	
    function get(ns, key, args, inst){
        if (!key){ 
            // if no key given, find first type member that is not a reserved function
            for (var property in ns) {
                if (!ns.hasOwnProperty(property)) {
                    continue;
                }
                
                if(!!~functionNames.indexOf(property)){
                    continue;
                }

                key = property;
                break;
            }                 
        }       

        if(!key || !ns.hasOwnProperty(key)){
            throw 'Did not find a registered type ' + (key ? key : '(no key given)'); 
        }

        if (inst){
            return new ns[key](args);
        }

        return ns[key];
    }


    // builds an object namespace from a string    
    klon.namespace = function(ns, rt){
        var nodes = ns.split('.');
        if (nodes.length === 0){
            throw 'Invalid namespace, must contain at least 1 node'
        }
        var root = rt;    
        for (var i = 0 ; i < nodes.length ; i ++){
            var node = nodes[i];
            root[node] = root[node] || {};
            root = root[node];
        }
        return root;
    };


    // logs stuff
    klon.log = function(message){
        if (!console || !klon.logging){
            return false;
        }

        console.log(message);   
    };

}());