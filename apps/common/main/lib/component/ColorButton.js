if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/Button'
], function () {
    'use strict';

    Common.UI.ColorButton = Common.UI.Button.extend({
        options : {
            hint: false,
            enableToggle: false
        },

        template: _.template([
            '<div class="btn-group" id="<%= id %>">',
                '<button type="button" class="btn btn-color dropdown-toggle <%= cls %>" data-toggle="dropdown" style="<%= style %>">',
                    '<span>&nbsp;</span>',
                '</button>',
            '</div>'
        ].join('')),

        setColor: function(color) {
            var border_color, clr,
                span = $(this.cmpEl).find('button span');
            this.color = color;

            if ( color== 'transparent' ) {
                border_color = '#BEBEBE';
                clr = color;
                span.addClass('color-transparent');
            } else {
                border_color = 'transparent';
                clr = (typeof(color) == 'object') ? '#'+color.color : '#'+color;
                span.removeClass('color-transparent');
            }
            span.css({'background-color': clr, 'border-color': border_color});
        }
    });
});