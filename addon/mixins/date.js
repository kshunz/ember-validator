import Ember from 'ember';
import moment from 'moment';

export default Ember.Mixin.create({

  DAYS: {
    sunday: 0,
    saturday: 6
  },

  CHECKS: {
    same: '===',
    notSame: '!==',
    before: '<', // before
    after: '>', // after
    beforeSame: '<=', // before or same
    afterSame: '>=' // after or same
  },

  compare: function(source, target, operator) {
    switch (operator) {
      case '===':
        return source.isSame(target);
      case '!==':
        return !source.isSame(target);
      case '>=':
        return source.isAfter(target) || source.isSame(target);
      case '<=':
        return source.isBefore(target) || source.isSame(target);
      case '>':
        return source.isAfter(target);
      case '<':
        return source.isBefore(target);
      default:
        return false;
    }
  },

  perform: function() {
    var value = this.model.get(this.property);
    var option;
    var target;

    var transform = function(value, format) {
      var date;
      if (typeof(value) === 'string') {
        if (format) {
          date = moment(value, format, true);
        } else {
          date = moment(new Date(value));
        }
      } else {
        date = moment(value);
      }
      return date;
    };

    var setTime = function(date, hours, minutes, seconds, milliseconds) {
      date.hours(hours);
      date.minutes(minutes);
      date.seconds(seconds);
      date.milliseconds(milliseconds);
      return date;
    };

    if (!Ember.isEmpty(value)) {
      value = transform(value, this.options.format);

      if (!this.options.time) {
        value = setTime(value, 0, 0, 0, 0);
      }

      if (!value.isValid()) {
        this.pushResult(this.options.messages.date);
      } else {
        if (this.options.weekend && [this.DAYS.sunday, this.DAYS.saturday].indexOf(value.day()) !== -1) {
          this.pushResult(this.options.messages.weekend);
        } else if (this.options.onlyWeekend && [this.DAYS.sunday, this.DAYS.saturday].indexOf(value.day()) === -1) {
          this.pushResult(this.options.messages.onlyWeekend);
        } else {
          for (var key in this.CHECKS) {
            option = this.options[key];
            if (!option) {
              continue;
            }

            target = transform(option.target, option.format);

            if (!this.options.time) {
              target = setTime(target, 0, 0, 0, 0);
            }

            if (!target.isValid()) {
              continue;
            }

            if (!this.compare(value, target, this.CHECKS[key])) {
              this.pushResult(this.options.messages[key], { date: target.format(option.format) });
            }
          }
        }
      }
    }
  }
});
