(function(){

	var type = function(){ };

	type.prototype = function () { this.apply(this, arguments); };

	type.prototype.work = function(){
	    return "some work";
	};

	klon.register("bar.foo", type);	

})();