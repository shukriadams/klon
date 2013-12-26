(function(){

	var type = function(){ };

	type.prototype = function () { this.apply(this, arguments); };

	type.prototype.execute = function(){
	    console.log('you just did a google search, well done!');
	    return "google results";
	};

	klon.register("foo.bar", 'google', type);

})();