/*

Klon is a javascript library for handling loose coupling. It supports
  on-demand loading of types
  namespaces
  interface-like contracts
  type injection

It has only one requirement : require.js
*/

// this is the only global variable klon uses.
var klon;

require([], function( ){
    
    'use strict';

    klon = {};
    klon.logging = false;

    // gets an instance
    // add optional interface as part of registration contract
    klon.register = function (ns, type, key) {
        
        // setup up and/or get namespace 
        ns = klon.namespace(ns);


        // attach types array to namespace
        if (!ns.types){
            ns.types = [];
        }


        // check if key exists
        for (var i = 0 ; i < ns.types.length ; i ++){
            var typeCheck = ns.types[i];
            if (typeCheck.key && typeCheck.key === key){
                throw new 'Type with key "' + key + '" already registered.';
            }
        }



        // attach "instance" method.
        // key : unique key type was registerd with
        // args : optional constructor args
        if (!ns.instance){
            ns.instance = function instance (key, args){
                return get(ns.types, key, args, true);
            }; 
        }

            
        // attach "type" method
        if (!ns.type){
            ns.type = function type(key){
                return get(ns.types, key, args, false);
            }
        }
        

        // check if type exists, allows use of "register" to set up empty namespaces.
        if (type){
           var reg = { "type" : type };
           if (key){
                reg.key = key;
           }

            ns.types.push(reg);
            klon.log('registered type ' + key);
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
            throw 'Did not find a registerd type ' + key;
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

});