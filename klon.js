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

    // names of functions klon attaches to namespaces.
    var functionNames = ["instance", "type", "clear"];

    // gets an instance
    // add optional interface as part of registration contract
    klon.register = function (ns, type, key) {

        // setup up and/or get namespace 
        var namespace = klon.namespace(ns);


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
            if (ns.hasOwnProperty(key)){
                key = "default";
            } else {
                // find first property that is not a reserve function
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
        }       

        if(!ns.hasOwnProperty(key)){
            throw 'Did not find a registered type ' + key;
        }

        if (inst){
            return new ns[key](args);
        }
        return ns[key];
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