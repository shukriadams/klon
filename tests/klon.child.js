(function () { 

    var type = function () { };
    
    type.prototype = function () { this.apply(this, arguments); };
    
    type.prototype.execute = function () {
        console.log('aw hell naw you didnt just do that');
        return "cube";
    };

    klon.register("klon.child", type);
}());