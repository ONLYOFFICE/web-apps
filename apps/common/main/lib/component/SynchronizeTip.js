if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/BaseView'
], function () {
    'use strict';

    Common.UI.SynchronizeTip = Common.UI.BaseView.extend(_.extend((function() {
        var tipEl;

        return {
            options : {
                target  : $(document.body),
                text    : '',
                placement: 'right'
            },

            template: _.template([
                '<div class="synch-tip-root <%= scope.placement %>">',
                    '<div class="asc-synchronizetip">',
                        '<div class="tip-arrow <%= scope.placement %>"></div>',
                        '<div>',
                            '<div class="tip-text" style="width: 260px;"><%= scope.text %></div>',
                            '<div class="close img-commonctrl"></div>',
                        '</div>',
                        '<div class="show-link"><label><%= scope.textDontShow %></label></div>',
                    '</div>',
                '</div>'
            ].join('')),

            initialize : function(options) {
                this.textSynchronize += Common.Utils.String.platformKey('Ctrl+S');
                
                Common.UI.BaseView.prototype.initialize.call(this, options);
                this.target = this.options.target;
                this.text = !_.isEmpty(this.options.text) ? this.options.text : this.textSynchronize;
                this.placement = this.options.placement;
            },

            render: function() {
                tipEl = $(this.template({ scope: this }));
                tipEl.find('.close').on('click', _.bind(function() { this.trigger('closeclick');}, this));
                tipEl.find('.show-link label').on('click', _.bind(function() { this.trigger('dontshowclick');}, this));

                $(document.body).append(tipEl);
                this.applyPlacement();

                return this;
            },

            show: function(){
                if (tipEl) {
                    this.applyPlacement();
                    tipEl.show()
                } else
                    this.render();
            },

            hide: function() {
                if (tipEl) tipEl.hide();
            },

            applyPlacement: function () {
                var showxy = this.target.offset();
                (this.placement == 'top') ? tipEl.css({bottom : $(document).height() - showxy.top + 'px', right: $(document).width() - showxy.left - this.target.width()/2 + 'px'})
                                         : tipEl.css({top : showxy.top + this.target.height()/2 + 'px', left: showxy.left + this.target.width() + 'px'});
            },

            textDontShow        : 'Don\'t show this message again',
            textSynchronize     : 'The document has been changed by another user.<br/>Please click to save your changes and reload the updates.'
        }
    })(), Common.UI.SynchronizeTip || {}));
});

