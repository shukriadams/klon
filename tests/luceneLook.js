(function () { 

    var type = function () { };
    
    type.prototype = function () { this.apply(this, arguments); };
    
    type.prototype.execute = function () {
        console.log('you just did a lucene search, well done!');
        return "lucene results";
    };

    klon.register("foo.bar", 'lucene', type); 
}());