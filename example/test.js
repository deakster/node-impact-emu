require("../../node-impact-emu").useAll(__dirname + "/lib");

ig.requires(
    'server.person'
);

var person = new Person();
console.log(person.speak());
