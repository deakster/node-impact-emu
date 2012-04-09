ig.module(
	'server.test'
).requires(
	// Enter modules that this one depends on here
).defines(function () {


Person = ig.Class.extend({
    name: "bob",
    age: 0,
    
    init: function () {
    	this.age = 25;
    },
    
    speak: function () {
    	return "Hi, my name is " + this.name + " and I am " + this.age + " years old";
    }
});


});
