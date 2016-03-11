/**
 *  InsertTableDialog.js
 *
 *  Created by Alexander Yuzhin on 2/17/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/Window'
], function () { 'use strict';

    Common.Views.InsertTableDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 230,
            height: 170,
            header: false,
            style: 'min-width: 230px;',
            cls: 'modal-dlg'
        },

        initialize : function(options) {
            _.extend(this.options, options || {});

            this.template = [
                '<div class="box">',
                    '<h4>' + this.txtTitle + '</h4>',
                    '<div class="input-row" style="margin: 10px 0;">',
                        '<label class="text columns-text" style="width: 130px;">' + this.txtColumns + '</label><div class="columns-val" style="float: right;"></div>',
                    '</div>',
                    '<div class="input-row" style="margin: 10px 0;">',
                        '<label class="text rows-text" style="width: 130px;">' + this.txtRows + '</label><div class="rows-val" style="float: right;"></div>',
                    '</div>',
                '</div>',
                '<div class="footer center">',
                    '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;">' + this.okButtonText + '</button>',
                    '<button class="btn normal dlg-btn" result="cancel">' + this.cancelButtonText + '</button>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template, this.options);

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.udColumns = new Common.UI.MetricSpinner({
                el          : $window.find('.columns-val'),
                step        : 1,
                width       : 64,
                value       : 2,
                defaultUnit : '',
                maxValue    : 63,
                minValue    : 1,
                allowDecimal: false
            });

            this.udRows = new Common.UI.MetricSpinner({
                el          : $window.find('.rows-val'),
                step        : 1,
                width       : 64,
                value       : 2,
                defaultUnit : '',
                maxValue    : 100,
                minValue    : 1,
                allowDecimal: false
            });
//            this.udColumns.on('entervalue', _.bind(this.onPrimary, this));
//            this.udRows.on('entervalue', _.bind(this.onPrimary, this));
        },

        onBtnClick: function(event) {
            if (this.options.handler) {
                this.options.handler.call(this, event.currentTarget.attributes['result'].value, {
                    columns : this.udColumns.getValue(),
                    rows    : this.udRows.getValue()
                });
            }

            this.close();
        },

        onPrimary: function() {
            if (this.options.handler) {
                this.options.handler.call(this, 'ok', {
                    columns : this.udColumns.getValue(),
                    rows    : this.udRows.getValue()
                });
            }

            this.close();
            return false;
        },

        txtTitle: 'Table size',
        txtColumns: 'Number of Columns',
        txtRows: 'Number of Rows',
        textInvalidRowsCols: 'You need to specify valid rows and columns count.',
        cancelButtonText: 'Cancel',
        okButtonText:   'Ok',
        txtMinText: 'The minimum value for this field is {0}',
        txtMaxText: 'The maximum value for this field is {0}'
    }, Common.Views.InsertTableDialog || {}))
});