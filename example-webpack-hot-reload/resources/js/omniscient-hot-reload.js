var component = require('omniscient');
var React = require('react');

var updaters = [];

module.exports = function (key) {
  if (typeof key !== 'string') throw new Error(
    "component() needs an id for hot reload to work, got " + key);

  var updater = updaters[key];
  if (updater) {
    return updater.update.apply(this, arguments);
  }

  updater = updaters[key] = createUpdater(key);
  return updater.create.apply(this, arguments);
};

function createUpdater (key) {

  var instances = [];

  var TrackInstancesMixin = {
    componentDidMount: function () {
      instances.push(this);
    },
    componentWillUnmount: function () {
      instances.splice(instances.indexOf(this), 1);
    }
  };

  var Component;

  function create () {
    Component = createComponent.apply(null, arguments);
    Component.reload = function reload () {
      instances.forEach(instance => {
        instance._bindAutoBindMethods();
        instance.forceUpdate();
      });
    };
    return Component;
  }

  function update () {
    createComponent.apply(null, arguments);
    return Component;
  }

  function createComponent () {
    var args = findComponentArgs(arguments);
    args.mixins.unshift(TrackInstancesMixin);
    var Component = component(args.key, args.mixins, args.render);
    patchExistingProtos(Component.jsx.type.prototype);
    return Component;
  }

  var protos = [];
  function patchExistingProtos (replacement) {
    protos.forEach(proto =>
      Object.keys(replacement)
            .forEach(key => patchProtoProperty(proto, key, replacement)
    ));
    protos.push(replacement);
  }

  function patchProtoProperty (proto, key, replacement) {
    proto[key] = replacement[key];

    if (typeof proto[key] !== 'function' || key === 'type' || key === 'constructor') {
      return;
    }

    proto[key] = function () {
      if (replacement[key]) {
        return replacement[key].apply(this, arguments);
      }
    };

    if (proto.__reactAutoBindMap[key]) {
      proto.__reactAutoBindMap[key] = proto[key];
    }
  }

  return { create: create, update: update };
}

function findComponentArgs (args) {
  args = [].slice.call(args);
  return {
    key:    args.filter(a => typeof a === 'string')[0],
    mixins: args.filter(Array.isArray) || [],
    render: args.filter(f => typeof f === 'function')[0]
  };
}
