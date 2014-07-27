'use strict';

var App = require('../../app');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var NUSMods = require('../../nusmods');
var _ = require('underscore');
var selectResultTemplate = require('../templates/select_result.hbs');
var template = require('../templates/select.hbs');
require('select2');

module.exports = Marionette.ItemView.extend({
  className: 'form-group',
  template: template,

  events: {
    'select2-selecting': 'onSelect2Selecting'
  },

  ui: {
    'input': 'input'
  },

  onMouseenter: function (event) {
    var button = $(event.currentTarget);
    button.children('span').hide();
    button.children('i').removeClass('hidden');
  },

  onMouseleave: function (event) {
    var button = $(event.currentTarget);
    button.children('span').show();
    button.children('i').addClass('hidden');
  },

  onMouseup: function (event) {
    event.stopPropagation();
    var button = $(event.currentTarget);
    var add = button.hasClass('add');
    App.request((add ? 'add' : 'remove') + 'Module', button.data('semester'), button.data('code'));
    button
      .toggleClass('add remove label-default label-success')
      .prop('title', (add ? 'Add to' : 'Remove from') + 'Timetable')
      .children('i').toggleClass('fa-plus fa-times');
  },

  onSelect2Open: function () {
    $('#select2-drop')
      .on('mouseenter', 'a', this.onMouseenter)
      .on('mouseleave', 'a', this.onMouseleave)
      .on('mouseup', 'a', this.onMouseup);
  },

  onSelect2Selecting: function(event) {
    event.preventDefault();
    Backbone.history.navigate('modules/' + event.val, {trigger: true});
    this.ui.input.select2('close');
    this.$(':focus').blur();
  },

  onShow: function () {
    _.bindAll(this, 'onMouseup', 'onSelect2Open');

    var PAGE_SIZE = 50;
    this.ui.input.select2({
      multiple: true,
      formatResult: function (object) {
        return selectResultTemplate(object);
      },
      query: function (options) {
        NUSMods.getCodesAndTitles().then(function (data) {
          var i,
            results = [],
            pushResult = function (i) {
              var code = data[i].ModuleCode;
              var semesters = data[i].Semesters;
              var sems = [{semester: 1}, {semester: 2}];
              for (var j = 0; j < semesters.length; j++) {
                var semester = semesters[j];
                if (semester === 1 || semester === 2) {
                  sems[semester - 1].offered = true;
                  sems[semester - 1].selected = App.request('isModuleSelected', semester, code);
                }
              }
              return results.push({
                id: code,
                semesters: sems,
                text: code + ' ' + data[i].ModuleTitle
              });
            };
          if (options.term) {
            var re = new RegExp(options.term, 'i');
            for (i = options.context || 0; i < data.length; i++) {
              if (data[i].ModuleCode.search(re) !== -1 || data[i].ModuleTitle.search(re) !== -1) {
                if (pushResult(i) === PAGE_SIZE) {
                  i++;
                  break;
                }
              }
            }
          } else {
            for (i = (options.page - 1) * PAGE_SIZE; i < options.page * PAGE_SIZE; i++) {
              pushResult(i);
            }
          }
          options.callback({
            context: i,
            more: i < data.length,
            results: results
          });
        });
      }
    });

    this.ui.input.one('select2-open', this.onSelect2Open);
  }
});
