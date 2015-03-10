import Form from 'ember-input';

export default Form.extend({

  unformat: function(formatted) {
    var stripped = (formatted || '').replace(/\s/g, '');
    var split = stripped.split('/');
    if (split.length > 1) {
      return [split[0].substring(0,2), split[1].substring(0,2)];
    } else {
      return [split[0].substring(0,2)];
    }
  },
  format: function(unformatted) {
    return (unformatted || []).join('/');
  },

  transform: function(unformatted) {
    this.format(unformatted);
  }
});
