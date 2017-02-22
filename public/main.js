(function($, root) {
  "use strict";

  var GOVUKAdmin = root.GOVUKAdmin = {
    Modules: {}
  };

  GOVUKAdmin.find = function(container) {

    var modules,
        moduleSelector = '[data-module]',
        container = container || $('body');

    modules = container.find(moduleSelector);

    // Container could be a module too
    if (container.is(moduleSelector)) {
      modules = modules.add(container);
    }

    return modules;
  }

  GOVUKAdmin.start = function(container) {

    var modules = this.find(container);

    for (var i = 0, l = modules.length; i < l; i++) {

      var module,
          element = $(modules[i]),
          type = camelCaseAndCapitalise(element.data('module'));

      if (typeof GOVUKAdmin.Modules[type] === "function") {
        module = new GOVUKAdmin.Modules[type]();
        module.start(element);
      }
    }

    // eg selectable-table to SelectableTable
    function camelCaseAndCapitalise(string) {
      return capitaliseFirstLetter(camelCase(string));
    }

    // http://stackoverflow.com/questions/6660977/convert-hyphens-to-camel-case-camelcase
    function camelCase(string) {
      return string.replace(/-([a-z])/g, function (g) {
        return g[1].toUpperCase();
      });
    }

    // http://stackoverflow.com/questions/1026069/capitalize-the-first-letter-of-string-in-javascript
    function capitaliseFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

  }

  GOVUKAdmin.startAll = function() {
    GOVUKAdmin.start();
    GOVUKAdmin.startBootstrapComponents();
  }

  GOVUKAdmin.startBootstrapComponents = function() {
    $('[data-toggle="tooltip"]').tooltip();
  }

  GOVUKAdmin.redirect = function(path) {
    window.location.href = path;
  }

  // Google Analytics pageview tracking
  GOVUKAdmin.trackPageview = function(path, title) {
    var pageviewObject = { page: path };

    if (typeof title === "string") {
      pageviewObject.title = title;
    }

    if (typeof root.ga === "function") {
      // https://developers.google.com/analytics/devguides/collection/analyticsjs/pages
      root.ga('send', 'pageview', pageviewObject);
    }
  }

  // Google Analytics event tracking
  // Label and value are optional
  GOVUKAdmin.trackEvent = function(action, label, value) {

    // https://developers.google.com/analytics/devguides/collection/analyticsjs/events
    // Default category to the page an event occurs on
    // Uses sendBeacon for all events
    // https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#transport
    var eventAnalytics = {
          hitType: 'event',
          transport: 'beacon',
          eventCategory: root.location.pathname,
          eventAction: redactEmails(action)
        };

    // Label is optional
    if (typeof label === "string") {
      eventAnalytics.eventLabel = redactEmails(label);
    }

    // Value is optional, but when used must be an
    // integer, otherwise the event will be invalid
    // and not logged
    if (value) {
      value = parseInt(value, 10);
      if (typeof value === "number" && !isNaN(value)) {
        eventAnalytics.eventValue = value;
      }
    }

    if (typeof root.ga === "function") {
      root.ga('send', eventAnalytics);
    }

    function redactEmails(string) {
      return string.replace(/\S+@\S+/g, '[email]');
    }
  }

  /*
    Cookie methods
    ==============
    Usage:

      Setting a cookie:
      GOVUKAdmin.cookie('hobnob', 'tasty', { days: 30 });

      Reading a cookie:
      GOVUKAdmin.cookie('hobnob');

      Deleting a cookie:
      GOVUKAdmin.cookie('hobnob', null);
  */
  GOVUKAdmin.cookie = function(name, value, options) {
    if(typeof value !== 'undefined'){
      if(value === false || value === null) {
        return GOVUKAdmin.setCookie(name, '', { days: -1 });
      } else {
        return GOVUKAdmin.setCookie(name, value, options);
      }
    } else {
      return GOVUKAdmin.getCookie(name);
    }
  };

  GOVUKAdmin.setCookie = function(name, value, options) {
    if (typeof options === 'undefined') {
      options = {};
    }
    var cookieString = name + "=" + value + "; path=/";
    if (options.days) {
      var date = new Date();
      date.setTime(date.getTime() + (options.days * 24 * 60 * 60 * 1000));
      cookieString = cookieString + "; expires=" + date.toGMTString();
    }
    if (options.domain) {
      cookieString = cookieString + "; domain=" + options.domain;
    }
    if (document.location.protocol == 'https:'){
      cookieString = cookieString + "; Secure";
    }
    document.cookie = cookieString;
  };

  GOVUKAdmin.getCookie = function(name) {
    var nameEQ = name + "=";
    var cookies = document.cookie.split(';');
    for(var i = 0, len = cookies.length; i < len; i++) {
      var cookie = cookies[i];
      while (cookie.charAt(0) == ' ') {
        cookie = cookie.substring(1, cookie.length);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
    return null;
  };

})(jQuery, window);
(function(Modules) {
  "use strict";

  Modules.AutoShowModal = function() {
    var that = this;
    that.start = function(element) {
      element.modal('show').on('hidden.bs.modal', function () {
        $(this).remove();
      });
    }
  };

})(window.GOVUKAdmin.Modules);
(function(Modules) {
  "use strict";

  Modules.AutoTrackEvent = function() {
    var that = this;
    that.start = function(element) {
      var action = element.data('track-action'),
          label = element.data('track-label'),
          value = element.data('track-value');

      GOVUKAdmin.trackEvent(action, label, value);
    }
  };

})(window.GOVUKAdmin.Modules);
(function(Modules) {
  "use strict";

  Modules.CheckboxToggle = function() {
    this.start = function(element) {
      var $checkboxes = element.find('input[type="checkbox"][data-target]');
      
      $checkboxes.each(function() {
        var $checkbox = $(this),
            target = $checkbox.data('target'),
            $target = $('#' + target);

        $checkbox.attr('aria-controls', target);
        toggle();
        $checkbox.on('click', toggle);

        function toggle() {
          var state = $checkbox.is(':checked');
          $target.toggle(state);
          setAriaAttr(state)
        }

        function setAriaAttr(state) {
          $checkbox.attr('aria-expanded', state);
          $target.attr('aria-hidden', !state);
        }
      });
    };
  };

})(window.GOVUKAdmin.Modules);
/*
  Show a confirm dialogue before continuing:
  <a href="#" data-module="confirm" data-message="Are you sure?">Delete this</a>
*/
(function(Modules) {
  "use strict";

  Modules.Confirm = function() {
    this.start = function(element) {
      element.on('click', confirm);

      function confirm(evt) {
        var message = element.data('message');
        if (! window.confirm(message)) {
          evt.preventDefault();
        }
      }
    };
  };

})(window.GOVUKAdmin.Modules);
(function(Modules) {
  "use strict";

  Modules.FilterableTable = function() {
    var that = this;
    that.start = function(element) {

      var rows = element.find('tbody tr'),
          tableInput = element.find('.js-filter-table-input'),
          filterForm;

      element.on('keyup change', '.js-filter-table-input', filterTableBasedOnInput);

      if (element.find('a.js-open-on-submit').length > 0) {
        filterForm = tableInput.parents('form');
        if (filterForm && filterForm.length > 0) {
          filterForm.on('submit', openFirstVisibleLink);
        }
      }

      function filterTableBasedOnInput(event) {
        var searchString = $.trim(tableInput.val()),
            regExp = new RegExp(escapeStringForRegexp(searchString), 'i');

        rows.each(function() {
          var row = $(this);
          if (row.text().search(regExp) > -1) {
            row.show();
          } else {
            row.hide();
          }
        });
      }

      function openFirstVisibleLink(evt) {
        evt.preventDefault();
        var link = element.find('a.js-open-on-submit:visible').first();
        GOVUKAdmin.redirect(link.attr('href'));
      }

      // http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
      // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/regexp
      // Escape ~!@#$%^&*(){}[]`/=?+\|-_;:'",<.>
      function escapeStringForRegexp(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
      }
    }
  };

})(window.GOVUKAdmin.Modules);
(function(Modules) {
  "use strict";

  Modules.FixedTableHeader = function() {
    var that = this;
    that.start = function(element) {

      // Clone the current table header into a fixed container
      // Use .container class for correct width and responsiveness
      // Setup a dummy table for correct rendering of cloned <thead>
      // Basics derived from http://stackoverflow.com/questions/4709390/

      var header = element.find('thead'),
          headerOffset = header.offset().top,
          fixedHeader = header.clone(),
          fixedHeaderContainer = $('\
          <div class="fixed-table-header-container">\
            <div class="container">\
              <table class="table table-bordered">\
              </table>\
            </div>\
          </div>');

      fixedHeaderContainer.hide().find('table').append(fixedHeader);
      element.prepend(fixedHeaderContainer);
      $(window).bind("scroll", checkOffsetAndToggleFixedHeader);

      function checkOffsetAndToggleFixedHeader() {
        var offset = $(window).scrollTop();
        if (offset >= headerOffset && fixedHeaderContainer.is(":hidden")) {
          fixedHeaderContainer.show();
        } else if (offset < headerOffset) {
          fixedHeaderContainer.hide();
        }
      }
    }
  };
})(window.GOVUKAdmin.Modules);
(function(Modules) {
  "use strict";

  Modules.RadioToggle = function() {
    this.start = function(element) {
      var $radios = element.find('input[type="radio"][data-target]'),
          radioGroups = {};

      $radios.each(function() {
        var $radio = $(this),
            target = $radio.data('target'),
            $target = $('#' + target);

        radioGroups[$radio.attr('name')] = true;

        $radio.attr('aria-controls', target);
        $radio.on('radioValueChanged', toggle);

        function toggle() {
          var state = $radio.is(':checked');
          $target.toggle(state);
          setAriaAttr(state);
        }

        function setAriaAttr(state) {
          $radio.attr('aria-expanded', state);
          $target.attr('aria-hidden', !state);
        }
      });

      listenToChangesOnRadioGroups();
      triggerToggles();

      function listenToChangesOnRadioGroups() {
        $.map(radioGroups, function(v, radioGroupName) {
          element.on('change', 'input[type="radio"][name="'+radioGroupName+'"]', triggerToggles);
        });
      }

      function triggerToggles() {
        $radios.trigger('radioValueChanged');
      }
    };
  };

})(window.GOVUKAdmin.Modules);
(function(Modules) {
  "use strict";

  Modules.Toggle = function() {

    var that = this;

    that.start = function(element) {
      element.on('click', '.js-toggle', toggle);
      element.on('click', '.js-cancel', cancel);

      function toggle(event) {
        element.find('.js-toggle-target').toggleClass('if-js-hide');
        element.find('input').first().focus();
        event.preventDefault();
      }

      function cancel(event) {
        toggle(event);
        element.find('input').first().val('');
      }
    };
  };

})(window.GOVUKAdmin.Modules);
(function(Modules) {
  "use strict";

  Modules.TrackClick = function() {
    var that = this;

    that.start = function(container) {
      var trackClick = function() {
        var action = container.data("track-action") || "button-pressed",
            label = $(this).data("track-label") || $(this).text();

        GOVUKAdmin.trackEvent(action, label);
      };

      container.on("click", ".js-track", trackClick);
    }
  };

})(window.GOVUKAdmin.Modules);
//= require jquery
//= require jquery_ujs
//= require bootstrap
//= require govuk-admin-template/govuk-admin
//= require_tree ./govuk-admin-template/modules

// Find and auto-start modules specified using the data-module="" pattern in markup
(function($, GOVUKAdmin) {
  $(function(){
    GOVUKAdmin.startAll();
  });

  $(window.document).on('click', 'a[data-toggle="modal-remote"]', function(evt) {
    evt.preventDefault();

    var $target = $($(this).data('target'));
    var $modal = $target.modal();
    var href = $(this).attr('href');
    var hash = '#' + href.split('#')[1]
    $modal.find('.modal-body').load(href, function (responseText, textStatus) {
      if ( textStatus !== 'success' && textStatus !== 'notmodified') return;

      var $dom = $(responseText);
      $modal.find('.modal-title').empty().append($dom.find('h1'));
      $modal.find('.modal-body').empty().append($dom.find(hash));
      $modal.show();
    });
  });
})(jQuery, window.GOVUKAdmin);
