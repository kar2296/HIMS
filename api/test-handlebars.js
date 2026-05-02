const Handlebars = require('handlebars');

class Person {}
Person.prototype.FirstName = "John";
const data = new Person();

const template = Handlebars.compile("Hello {{FirstName}}!");

console.log("Without options:", template(data));
console.log("With options:", template(data, { allowProtoPropertiesByDefault: true, allowProtoMethodsByDefault: true }));

