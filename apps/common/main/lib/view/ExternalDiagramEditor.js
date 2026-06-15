/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/**
 *  ExternalDiagramEditor.js
 *
 *  Created on 4/08/14
 *
 */
define([
    'common/main/lib/view/ExternalEditor'
], function () { 'use strict';
    Common.Views.ExternalDiagramEditor = Common.Views.ExternalEditor.extend(_.extend({
        initialize : function(options) {
            var _options = {};
            _.extend(_options,  {
                id: 'id-external-diagram-editor',
                title: this.textTitle,
                // storageName: 'diagram-editor',
                sdkplaceholder: 'id-diagram-editor-placeholder',
                initwidth: 730,
                initheight: 275,
                minwidth: 730,
                minheight: 275,
                footer: false,
                transparentMask: true
            }, options);

            this._chartData = null;
            Common.Views.ExternalEditor.prototype.initialize.call(this, _options);
        },

        show: function() {
            this.setPlaceholder();
            Common.Views.ExternalEditor.prototype.show.apply(this, arguments);
        },

        setChartData: function(data) {
            this._chartData = data;
            if (this._isExternalDocReady)
                this.fireEvent('setchartdata', this);
        },

        setPlaceholder: function(placeholder) {
            this._placeholder = placeholder;
        },

        getPlaceholder: function() {
            return this._placeholder;
        },

        textTitle: 'Chart Editor'
    }, Common.Views.ExternalDiagramEditor || {}));
});
