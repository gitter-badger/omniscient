var reloadableComponent = require('./omniscient-hot-reload');
var React = require('react');

module.exports = component('Clicks', function (props) {
  var self = this;
  function onClick () {
    self.props.clicks.update(clicks => clicks + 1);
  }
  return (
    <div>
      -- change this text -- {this.props.clicks.deref()}
      <button onClick={onClick}>up</button>
    </div>
  );
});
