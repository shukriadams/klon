/* type that registeres itself without a key*/
(function(){

	var type = function(){ };

	type.prototype = function () { this.apply(this, arguments); };

	type.prototype.execute = function(){
	    return 1;
	};

	klon.register("foo.bar", type);	// use no key here

})();