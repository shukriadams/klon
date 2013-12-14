/*
    Klon is a javascript library for handling namespaces and loose coupling. 
    Author : Shukri Adams (shukri.adams@gmail.com), 2013
    Klon is available under the MIT license and can be freely distributed.
    
    http://github.com/shukriadams/klon
*/

// this is the only global variable klon uses.
var klon;

(function(){
    
    'use strict';

    // setup global if it doesn't exist, else state will be reset each time script is read    
    if (klon == null){
        klon = {};
        klon.logging = false;
        klon.attachToWindow = true;
    }

    // gets an instance
    // add optional interface as part of registration contract
    klon.register = function (ns, type, key) {

        // setup up and/or get namespace 
        var namespace = klon.namespace(ns);


        // attach types array to namespace
        if (!namespace.types){
            namespace.types = [];
        }


        // check if key exists
        for (var i = 0 ; i < namespace.types.length ; i ++){
            var typeCheck = namespace.types[i];
            if (typeCheck.key && typeCheck.key === key){
                throw new 'Type with key "' + key + '" already registered.';
            }
        }



        // attach "instance" method.
        // key : unique key type was registerd with
        // args : optional constructor args
        if (!namespace.instance){
            namespace.instance = function instance (key, args){
                // "overload"
                if (!args && typeof key === 'object' ){
                    args = key;
                    key = null;
                }

                return get(namespace.types, key, args, true);
            }; 
        }

            
        // attach "type" method
        if (!namespace.type){
            namespace.type = function type(key){
                return get(namespace.types, key, null, false);
            }
        }
        

        // check if type exists, allows use of "register" to set up empty namespaces.
        if (type){
           var reg = { "type" : type };
           if (key){
                reg.key = key;
           }

            namespace.types.push(reg);
            klon.log('registered type at namespace ' + ns + (key?' '+key:'') );
        }
    };


    // gets an instance or raw type	
    function get(types, key, args, inst){
        if (!types || types.length === 0)
            throw "No types registered at this namespace node.";

        if (key){
            for (var i = 0 ; i < types.length ; i ++){
                var type = types[i];
                if (type.key && type.key === key){
                    if (inst){
                        return new type.type(args);
                    }
                    return type.type;
                }
            }
            throw 'Did not find a registered type ' + key;
        }       
        else {
            // no key given, return default
            if (inst){
                return new types[0].type(args);
            }
            return types[0].type;
        }
    }


    // builds an object namespace from a string    
    klon.namespace = function(ns){
        var nodes = ns.split('.');
        if (nodes.length === 0){
            throw 'Invalid namespace, must contain at least 1 node'
        }

        var built = "window";
        var test = window;
        for (var i = 0 ; i < nodes.length ; i ++){
            var node = nodes[i];
            var script = built + "." + node + " = " + built +"." + node + " || {};";
            eval(script);
            built = built + "." + node;
        }

        var n = null;
        eval ("n = " + built + ";");
        return n;
    };


    // logs stuff
    klon.log = function(message){
        if (!console || !klon.logging){
            return false;
        }

        console.log(message);   
    };

}());