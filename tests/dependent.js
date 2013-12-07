/* type that need another type reigstered in klon */
(function(){

	var type = function(){ };

	type.prototype = function () { this.apply(this, arguments); };

	type.prototype.execute = function(){
	    var worker = new window.bar.foo.instance();
	    return worker.work();
	};

	klon.register("schmoo.beer", type);	// use no key here

})();