/**
 * User: Julia.Radzhabova
 * Date: 06.03.15
 * Time: 11:46
 */

if (Common === undefined)
    var Common = {};

Common.Views = Common.Views || {};

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout'
], function (template) {
    'use strict';

    Common.Views.History = Common.UI.BaseView.extend(_.extend({
        el: '#left-panel-history',

        storeHistory: undefined,
        template: _.template([
            '<div id="history-box" class="layout-ct vbox">',
                '<div id="history-header" class="">',
                    '<div id="history-btn-back"><%=scope.textHistoryHeader%></div>',
                '</div>',
                '<div id="history-list" class="">',
                '</div>',
            '</div>'
        ].join('')),

        initialize: function(options) {
            _.extend(this, options);
            Common.UI.BaseView.prototype.initialize.call(this, arguments);
        },

        render: function(el) {
            el = el || this.el;
            $(el).html(this.template({scope: this})).width( (parseInt(Common.localStorage.getItem('de-mainmenu-width')) || MENU_SCALE_PART) - SCALE_MIN);

            this.viewHistoryList = new Common.UI.DataView({
                el: $('#history-list'),
                store: this.storeHistory,
                enableKeyEvents: false,
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="history-item-wrap" style="display: block;">',
                        '<div class="user-date"><%= created %></div>',
                        '<% if (markedAsVersion) { %>',
                        '<div class="user-version">ver.<%=version%></div>',
                        '<% } %>',
                        '<div class="user-name">',
                            '<div class="color" style="display: inline-block; background-color:' + '<%=usercolor%>;' + '" >',
                            '</div><%= Common.Utils.String.htmlEncode(username) %>',
                        '</div>',
                    '</div>'
                ].join(''))
            });

            this.btnBackToDocument = new Common.UI.Button({
                el: $('#history-btn-back'),
                enableToggle: false
            });
            
            this.trigger('render:after', this);
            return this;
        },

        textHistoryHeader: 'Back to Document'
        
    }, Common.Views.History || {}))
});