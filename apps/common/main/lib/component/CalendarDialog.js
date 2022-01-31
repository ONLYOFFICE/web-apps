/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
*/
/**
 *  CalendarDialog.js
 *
 *  Created by Olga Sharova on 28/01/21
 *  Copyright (c) 2021 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};
define([
    'common/main/lib/component/Window'
], function () { 'use strict';
    Common.UI.CalendarDialog = Common.UI.Window.extend(_.extend({
        options: {
            header: false,
            cls: 'calendar-dlg'
        },

        initialize : function(options) {
            _.extend(this.options,  options || {});
            this.template = [
                '<div class="box" >',
                '<div id = "id-calendar-box" ></div>',
                '</div>'
            ].join('');
            this.options.tpl = _.template(this.template)(this.options);
            this._state=[];
            this._state.date = options.date;
            this.handler =   this.options.handler;
            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            //me = this;
            Common.UI.Window.prototype.render.call(this);
            this.wndCalendar = new Common.UI.Calendar({
                el: $('#id-calendar-box'),
                date: this._state.date,
                enableKeyEvents: true,
                firstday: 1

            });
            this.wndCalendar.setDate(this._state.date);
            this.wndCalendar.on('date:click', _.bind(this.onSetDate,this));
        },

        onSetDate: function (){
            this._state.date = this.wndCalendar.selectedDate;
            this._handleInput('ok');
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                this.options.handler.call(this, state, this._state);
            }

            this.close();
        },
        textTitle: 'More Effects'

    }, Common.UI.CalendarDialog || {}));
});