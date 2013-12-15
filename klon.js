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
        klon.root = window;     // klon needs a global object to attach namespaces to. This can be override if needed.
        klon.logging = false;   // true if klon should go verbose. For development.
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


        // remove item if it exists already
        if (key){
            for (var i = 0 ; i < namespace.types.length ; i ++){
                var typeCheck = namespace.types[i];
                if (typeCheck.key && typeCheck.key === key){
                    namespace.types.splice(i, 1);
                    break;
                }
            }
        }


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

                return get(namespace.types, key, args, true);
            }; 
        }

            
        // Attach "type" method which returns the type (class) with the requested
        // key, or the first type at the node if no key is given.
        if (!namespace.type){
            namespace.type = function type(key){
                return get(namespace.types, key, null, false);
            }
        }


        // clears all types at the node.
        if (!namespace.clear){
            namespace.clear = function clear(){
                namespace.types = [];
            }
        }        


        // attach type directly to namespace as node of its own, if it has a key
        if (key){
            namespace[key] = type;
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

        var root = klon.root;
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