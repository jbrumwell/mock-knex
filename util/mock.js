module.exports = function mockProperty(object, property, method) {
  var mockedProperty = object[property];
  object[property] = method;

  method.restore = function () {
    object[property] = mockedProperty;
  }
}
