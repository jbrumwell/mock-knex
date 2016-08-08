function mockProperty(object, property, method) {
  var mockedProperty = object[property];
  object[property] = method;

  method.restore = function () {
    object[property] = mockedProperty;
  }
}

function mockPrototype(object, property, method) {
  var mockedProperty = object[property];
  var mockedPrototype = object.constructor.prototype[property];

  object.constructor.prototype[property] = object[property] = method;

  method.restore = function () {
    object[property] = mockedProperty;
    object.constructor.prototype[property] = mockedPrototype;
  }
}

module.exports = {
  mockProperty: mockProperty,
  mockPrototype: mockPrototype,
}
