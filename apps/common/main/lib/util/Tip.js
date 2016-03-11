/* ===========================================================
 *
 * Extends bootstrap-tooltip.js
 *
 * =========================================================== */
/*
*   Configuration
*   =============
*
*   @cfg {String} trigger
*   Default value is 'hover focus'.
*   Describes how tooltip is triggered - click | hover | focus | manual. 
*   You may pass multiple triggers; separate them with a space
*
*   @cfg {String} title
*
*   @cfg {Boolean} arrow
*   Default value is 'false'.
*   If 'true', shows an arrow that point to the parent component.    
*
*   @cfg {String} placement
*   Default value is 'top'.
*   Describes tooltips position relatively of the parent component
*   acceptable values: 'top', 'bottom', 'right', 'left', 
*                        'top-right/left', 'bottom-right/left', 'cursor'
*   If placement = 'cursor', tooltip doesn't arrange position relatively 
*   of the parent and shows relatively of the cursor position.    
*
*   @cfg {String} cls
*   An extra CSS class that will be added to tooltip dom-element.
*
*   @cfg {Boolean} html
*   Default value is 'false'.
*   Insert HTML into the tooltip. If false, jQuery's text method will be used 
*   to insert content into the DOM
*
*
*   Events
*   ======
*    
*   @event show.bs.tooltip
*   @event shown.bs.tooltip
*   @event hide.bs.tooltip
*   @event hidden.bs.tooltip
*
*/

(function ($) {
    var _superclass = $.fn.tooltip;
    _superclass.prototype = $.fn.tooltip.Constructor.prototype;

    $.extend($.fn.tooltip.Constructor.DEFAULTS, {
        container: 'body',
        delay: {show:500},
        arrow: false
    });

    var Tip = function (element, options) {
        this.init('tooltip', element, options);
    };

    Tip.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype, {
        constructor: Tip,
        
        init: function() {
            _superclass.prototype.init.apply(this, arguments);

            if (this.options.placement == 'cursor') {
                if (/hover/.exec(this.options.trigger)) {
                    this.$element.on('mousemove.tooltip', this.options.selector, $.proxy(this.mousemove, this))
                }
            }

            if (this.options.zIndex) {
                this.tip().css('z-index', this.options.zIndex);
            }

            var me = this;
            Common.NotificationCenter.on({'layout:changed': function(e){
                if (!me.options.hideonclick && me.tip().is(':visible'))
                    me.hide();
            }});
        },

        mousemove: function (e) {
            this.targetXY = [e.clientX, e.clientY];
        },

        leave: function(obj) {
            _superclass.prototype.leave.apply(this, arguments);
            this.dontShow = undefined;
        },

        show: function(at) {
            if (this.hasContent() && this.enabled && !this.dontShow) {
                if (!this.$element.is(":visible") && this.$element.closest('[role=menu]').length>0) return;
                var $tip = this.tip();
                var placement = typeof this.options.placement === 'function' ?
                                    this.options.placement.call(this, $tip[0], this.$element[0]) : this.options.placement;

                if (this.options.arrow === false) $tip.addClass('arrow-free');
                if (this.options.cls) $tip.addClass(this.options.cls);
                
                var placementEx = /^([a-zA-Z]+)-?([a-zA-Z]*)$/.exec(placement);

                if (!at && !placementEx[2].length) {
                    _superclass.prototype.show.apply(this, arguments);
                } else {
                    var e = $.Event('show.bs.tooltip');
                    this.$element.trigger(e);
                    if (e.isDefaultPrevented()) { return; }

                    this.setContent();

                    if (this.options.animation) $tip.addClass('fade');

                    $tip.detach()
                        .css({top: 0, left: 0, display: 'block'});

                    this.options.container ?
                        $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element);

                    if (typeof at == 'object') { 
                        var tp = {top: at[1] + 15, left: at[0] + 18};

                        if (tp.left + $tip.width() > window.innerWidth) {
                            tp.left = window.innerWidth - $tip.width() - 30;
                        }

                        $tip.offset(tp).addClass('in');
                    } else {
                        var pos = this.getPosition();

                        var actualWidth = $tip[0].offsetWidth,
                            actualHeight = $tip[0].offsetHeight;

                        switch (placementEx[1]) {
                        case 'bottom':  tp = {top: pos.top + pos.height + 10}; break;
                        case 'top':     tp = {top: pos.top - actualHeight - 10}; break;
                        }

                        switch (placementEx[2]) {
                        case 'left':    
                            tp.left = pos.left; 
                            if (this.$element.outerWidth() <= 18) {tp.left -= 4;} // if button is small move tooltip left
                            break;
                        case 'right':   
                            tp.left = pos.left + pos.width - actualWidth; 
                            if (this.$element.outerWidth() <= 18) { tp.left += 4;} 
                            break;
                        }

                        this.applyPlacement(tp, placementEx[1]);
                        this.moveArrow();

                        $tip/*.removeClass(orgPlacement)*/
                            .addClass(placementEx[1])
                            .addClass(placementEx[0]);

                    } 

                    this.$element.trigger('shown.bs.tooltip');
                }

                var self = this;
                clearTimeout(self.timeout);
                self.timeout = setTimeout(function () {
                    if (self.hoverState == 'in') self.hide();
                    self.dontShow = false;
                }, 5000);
            }
        },

        moveArrow: function () {
            var $arrow = this.tip().find(".tooltip-arrow, .arrow");
            var new_arrow_position = 10;
            switch (this.options.placement) {
            case 'top-left':
            case 'bottom-left':
                $arrow.css("left", new_arrow_position);
                break;
            case 'top-right':
            case 'bottom-right':
                $arrow.css("right", new_arrow_position);
                break;
          }
        },

        enter: function(obj) {
            if (obj.type !== 'mouseenter') return;
            var $target = $(obj.target);
            if ($target.is('[role=menu]') || $target.parentsUntil(obj.currentTarget,'[role=menu]').length && obj.target !== obj.currentTarget || this.tip().is(':visible') ) {return;}

            var self = obj instanceof this.constructor ?
                                obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.tooltip');

            clearTimeout(self.timeout);
            self.hoverState = 'in';

            if (!self.options.delay || !self.options.delay.show) { 
                self.show(); 
            } else {
                self.timeout = setTimeout(function () {
                    if (self.hoverState == 'in') {
                        self.show(self.options.placement == 'cursor' ? self.targetXY : undefined);
                    }
                }, self.options.delay.show);
            }
        },

        replaceArrow: function(delta, dimension, position) {
            this.options.arrow === false ?
                this.arrow().hide() : _superclass.prototype.replaceArrow.apply(this, arguments);
        },

        getCalculatedOffset: function (placement, pos, actualWidth, actualHeight) {
            var out = _superclass.prototype.getCalculatedOffset.apply(this, arguments);

            if (this.options.offset > 0 || this.options.offset < 0) {
                switch (/(bottom|top)/.exec(placement)[1]) {
                case 'bottom': out.top += this.options.offset; break;
                case 'top': out.top -= this.options.offset; break;
                }
            }

            return out;
        }
    });



 /* TOOLTIP EXTRA PLUGIN DEFINITION
  * ========================= */

  var old = $.fn.tooltip;

  $.fn.tooltip = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('bs.tooltip')
        , options = typeof option === 'object' && option;
      if (!data) { $this.data('bs.tooltip', (data = new Tip(this, options))); }
      if (typeof option === 'string') { data[option](); }
    });
  };

  $.fn.tooltip.Constructor = Tip;

  
 /* TOOLTIP EXTRA NO CONFLICT
  * =================== */

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old;
    return this;
  };

})(window.jQuery);
