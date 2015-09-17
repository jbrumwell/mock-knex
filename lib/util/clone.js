module.exports = function clone(client) {
  return Object.create(
    Object.getPrototypeOf(client),
    Object.getOwnPropertyNames(client).reduce(
      function(prev,cur){
        prev[cur]=Object.getOwnPropertyDescriptor(client,cur);
        return prev;
      },
      {}
    )
  );
}
