/* ========================================================================
 * Bootstrap: collapse.js v3.3.7
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

/* jshint latedef: false */

+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.$trigger      = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
                           '[data-toggle="collapse"][data-target="#' + element.id + '"]')
    this.transitioning = null

    if (this.options.parent) {
      this.$parent = this.getParent()
    } else {
      this.addAriaAndCollapsedClass(this.$element, this.$trigger)
    }

    if (this.options.toggle) this.toggle()
  }

  Collapse.VERSION  = '3.3.7'

  Collapse.TRANSITION_DURATION = 350

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var activesData
    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')

    if (actives && actives.length) {
      activesData = actives.data('bs.collapse')
      if (activesData && activesData.transitioning) return
    }

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    if (actives && actives.length) {
      Plugin.call(actives, 'hide')
      activesData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)
      .attr('aria-expanded', true)

    this.$trigger
      .removeClass('collapsed')
      .attr('aria-expanded', true)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse in')
      .attr('aria-expanded', false)

    this.$trigger
      .addClass('collapsed')
      .attr('aria-expanded', false)

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .removeClass('collapsing')
        .addClass('collapse')
        .trigger('hidden.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }

  Collapse.prototype.getParent = function () {
    return $(this.options.parent)
      .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
      .each($.proxy(function (i, element) {
        var $element = $(element)
        this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
      }, this))
      .end()
  }

  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
    var isOpen = $element.hasClass('in')

    $element.attr('aria-expanded', isOpen)
    $trigger
      .toggleClass('collapsed', !isOpen)
      .attr('aria-expanded', isOpen)
  }

  function getTargetFromTrigger($trigger) {
    var href
    var target = $trigger.attr('data-target')
      || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

    return $(target)
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.collapse

  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var $this   = $(this)

    if (!$this.attr('data-target')) e.preventDefault()

    var $target = getTargetFromTrigger($this)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()

    Plugin.call($target, option)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: dropdown.js v3.3.7
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle="dropdown"]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.VERSION = '3.3.7'

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }

  function clearMenus(e) {
    if (e && e.which === 3) return
    $(backdrop).remove()
    $(toggle).each(function () {
      var $this         = $(this)
      var $parent       = getParent($this)
      var relatedTarget = { relatedTarget: this }

      if (!$parent.hasClass('open')) return

      if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return

      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this.attr('aria-expanded', 'false')
      $parent.removeClass('open').trigger($.Event('hidden.bs.dropdown', relatedTarget))
    })
  }

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $(document.createElement('div'))
          .addClass('dropdown-backdrop')
          .insertAfter($(this))
          .on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this
        .trigger('focus')
        .attr('aria-expanded', 'true')

      $parent
        .toggleClass('open')
        .trigger($.Event('shown.bs.dropdown', relatedTarget))
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive && e.which != 27 || isActive && e.which == 27) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }

    var desc = ' li:not(.disabled):visible a'
    var $items = $parent.find('.dropdown-menu' + desc)

    if (!$items.length) return

    var index = $items.index(e.target)

    if (e.which == 38 && index > 0)                 index--         // up
    if (e.which == 40 && index < $items.length - 1) index++         // down
    if (!~index)                                    index = 0

    $items.eq(index).trigger('focus')
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.dropdown

  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
    .on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)

}(jQuery);

$( document ).ready(function() {

    /**
     * The calendar months
     * @type {string[]}
     */
    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    /**
     * Add leading zero to dates
     * @param n
     * @returns {string}
     */
    var addLeadingZero = function(n) {
        return (n < 10) ? ("0" + n) : n;
    }

    /**
     * Display a news feed item
     *
     * @param title
     * @param thumbnail
     * @param date
     * @param displayNewsItem
     */
    var displayNewsItem = function(title, thumbnail, date, displayNewsItem) {
        var newsItem = '<a href="' + displayNewsItem + '" class="media" target="_blank"><div class="media-left">';
        newsItem += '<img class="media-object" aria-hidden="true" src="' + thumbnail + '" alt="' + title + '"></div><div class="media-body">';
        newsItem += '<h4 class="media-heading">' + title + '</h4>';
        newsItem += '<p class="media-date">' + date + '</p></div></a>';

        $('#panel-news').append(newsItem);
    };

    /**
     * Display an event item
     *
     * @param title
     * @param location
     * @param date
     * @param link
     */
    var displayEventItem = function(title, location, date, link) {
        var eventItem = '<a href="' + link + '" class="media" target="_blank"><div class="media-body">';
        eventItem += '<h4 class="media-heading">' + title + '</h4>';
        eventItem += '<p class="media-date">' + date + '</p>';
        eventItem += '<p class="media-location">' + location + '</p></div></a>';

        $('#panel-events').append(eventItem);
    };

    /**
     * Display a seeking participants item
     *
     * @param title
     * @param department
     * @param thumbnail
     * @param link
     */
    var displayParticipants = function(title, department, thumbnail, link) {
        var opportunityItem = '<a href="' + link + '" class="media" target="_blank"><div class="media-left">';
        opportunityItem += '<img class="media-object" aria-hidden="true" src="' + thumbnail + '" alt="' + title + '"></div><div class="media-body">';
        opportunityItem += '<h4 class="media-heading">' + title + '</h4>';
        opportunityItem += '<p class="media-date">' + department + '</p></div></a>';

        $('#panel-participants').append(opportunityItem);
    };

    /**
     * Get the news feed
     */
    var getNewsFeed = function() {
        $.get('/feeds/uop-news.json', function(newsFeed) {
            $('#panel-news').empty();
            var topNews = newsFeed.posts.slice(0, 3);
            for(var i = 0; i < topNews.length; i++){
                var newsItem = topNews[i];
                var title = newsItem.title;
                var thumbnail = newsItem.thumbnail_images.medium.url;

                //Use a placeholder thumbnail if none exists
                if (thumbnail == '' || thumbnail === undefined) {
                    thumbnail = '/images/placeholder/news.png';
                }

                var date = newsItem.date.split(/[- :]/);
                date = new Date(Date.UTC(date[0], date[1]-1, date[2], date[3], date[4], date[5]));
                var dateString = "Posted: " + date.getUTCDate() + " " + monthNames[date.getMonth()] + " " + date.getFullYear();
                var url = newsItem.url;
                displayNewsItem(title, thumbnail, dateString, url);
            }
        }).fail(function() {
            $('#panel-news').empty().append('Error loading feed');
        });
    };

    /**
     * Get the events feed
     */
    var getEventsFeeds = function() {
        $.get('/feeds/uop-events.json', function(eventsFeeds) {
            $('#panel-events').empty();
            var topEvents = eventsFeeds.posts.reverse();
            var index = 0;
            var numEvents = 0;
            for(var i = 0; i < topEvents.length; i++){
                var topEvent = topEvents[i];

                var title = topEvent.title;

                var location = topEvent.custom_fields.eventvenue;
                if (location.length > 0) {
                    location = location[0];
                } else {
                    location = '';
                }

                var startDate = topEvent.custom_fields.eventdate[0].split(/[- :]/);
                startDate = new Date(Date.UTC(startDate[0], startDate[1]-1, startDate[2], startDate[3], startDate[4]));

                if (isNaN(startDate.getUTCDate())) {
                    continue;
                }

                //If the date is in the past
                var now = new Date();
                if (startDate < now) {
                    continue;
                }
                index++;
                if (index == 4) {
                    break;
                }
                var endDate = topEvent.custom_fields.eventdateend[0].split(/[- :]/);
                endDate = new Date(Date.UTC(endDate[0], endDate[1]-1, endDate[2], endDate[3], endDate[4]));

                var dateString = '';

                //If on the event is on a single day
                if (startDate.getUTCDate() == endDate.getUTCDate() && startDate.getMonth() == endDate.getMonth()) {
                    dateString = startDate.getUTCDate() + " " + monthNames[startDate.getMonth()] + " " + startDate.getFullYear() +
                        " - " + addLeadingZero(startDate.getUTCHours()) + ":" + addLeadingZero(startDate.getMinutes()) + " until " +
                        addLeadingZero(endDate.getUTCHours()) + ":" + addLeadingZero(endDate.getMinutes());
                } else {
                    dateString = startDate.getUTCDate() + " " + monthNames[startDate.getMonth()] + " " + startDate.getFullYear() +
                        " - " + addLeadingZero(startDate.getUTCHours()) + ":" + addLeadingZero(startDate.getMinutes()) + " until </br>" +
                        endDate.getUTCDate() + " " + monthNames[endDate.getMonth()] + " " + endDate.getFullYear() + " - " +
                        addLeadingZero(endDate.getUTCHours()) + ":" + addLeadingZero(endDate.getMinutes());
                }

                var url = topEvent.url;

                displayEventItem(title, location, dateString, url);
                numEvents++;
            }

            if (numEvents == 0) {
                $('#panel-events').append('<p>There are no upcoming events</p>');
            }
        }).fail(function() {
            $('#panel-events').empty().append('Error loading feed');
        });
    };

    /**
     * Get the participants needed feed
     */
    var getParticipantsFeed = function() {
        $.get('/feeds/uop-participants.json', function(participantsFeed) {
            $('#panel-participants').empty();
            var topOpportunities = participantsFeed.posts.slice(0, 3);
            for(var i = 0; i < topOpportunities.length; i++){
                var opportunity = topOpportunities[i];
                var title = opportunity.title;

                var department = '';
                if (opportunity.custom_fields.customdepartment.length > 0) {
                    department = opportunity.custom_fields.customdepartment[0];
                }

                var thumbnail = opportunity.thumbnail_images.medium.url;

                //Use a placeholder thumbnail if none exists
                if (thumbnail == '' || thumbnail === undefined) {
                    thumbnail = '/images/placeholder/news.png';
                }

                var url = opportunity.url;
                displayParticipants(title, department, thumbnail, url);
            }
        }).fail(function() {
            $('#panel-participants').empty().append('Error loading feed');
        });
    };

    //Get the feeds
    getNewsFeed();
    getEventsFeeds();
    getParticipantsFeed();
});
$( document ).ready(function() {

    var popularTopicsApiEndpoint = "https://restapi-portsmouth.kb.net/API/Article/HotTopics?PortalID=4&ClientID=12&TopCount=6&DateRange=15&ApiKey=E5p%2FZwD5SrqFPKFB7R2i74hCGNYkr478uWqdbZMujNI%3D&_=1485011710732";

    /**
     * Clear the default popular topics
     */
    var clearPopularTopics = function() {
        $('#popular-topics-1').empty();
        $('#popular-topics-2').empty();
    };

    /**
     * Generate the quick link
     * @param articleName
     * @param articleId
     * @returns {string}
     */
    var generateLink = function(articleName, articleId) {
        return '<li class="quick-link"><a href="https://kb.myport.ac.uk/Article/Index/12/4?id=' + articleId + '" target="_blank" role="link">' + articleName + '</a></li>';
    };

    var getPopularTopics = function() {
        $.get(popularTopicsApiEndpoint, function(popularTopics) {
            clearPopularTopics();
            //Sort the articles by the number of characters in their name (prevents uneven columns)
            popularTopics.sort(function (a, b) {
                return a.ArticleName.length - b.ArticleName.length;
            });

            for(var i = 0; i < popularTopics.length; i++) {
                var article = popularTopics[i];
                var linkHtml = generateLink(article.ArticleName, article.ArticleID);
                //Separate the links into two columns
                if (i % 2 == 0) {
                    $('#popular-topics-1').append(linkHtml);
                } else {
                    $('#popular-topics-2').append(linkHtml);
                }
            }
        }).fail(function() {
            //No need to handle fail because the default popular topics remain
        });
    };

    getPopularTopics();

});