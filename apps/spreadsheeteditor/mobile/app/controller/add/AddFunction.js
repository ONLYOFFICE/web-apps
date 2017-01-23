/*
 *
 * (c) Copyright Ascensio System Limited 2010-2017
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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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
 *  AddFunction.js
 *
 *  Created by Maxim Kadushkin on 12/14/2016
 *  Copyright (c) 2016 Ascensio System SIA. All rights reserved.
 *
 */


define([
    'core',
    'spreadsheeteditor/mobile/app/view/add/AddFunction',
    'text!../../../resources/l10n/functions/en.json',
    'text!../../../resources/l10n/functions/en_desc.json'
], function (core, view, fc, fd) {
    'use strict';

    SSE.Controllers.AddFunction = Backbone.Controller.extend(_.extend((function() {

        return {
            models: [],
            collections: [],
            views: [
                'AddFunction'
            ],

            initialize: function () {
                Common.NotificationCenter.on('addcontainer:show', _.bind(this.initEvents, this));

                this.addListeners({
                    'AddFunction': {
                        'function:insert': this.onInsertFunction.bind(this),
                        'function:info': this.onFunctionInfo.bind(this)
                    }
                });
            },

            setApi: function (api) {
                this.api = api;
            },

            onLaunch: function () {
                this.createView('AddFunction').render();

                var me = this;
                _.defer(function () {
                    me.api.asc_setLocalization(fc);
                    me.fillFunctions.call(me);
                });
            },

            initEvents: function () {
            },

            fillFunctions: function() {
                var functions = {};
                var jsonDescr   = JSON.parse(fd);

                var grouparr = this.api.asc_getFormulasInfo();
                for (var g in grouparr) {
                    var group = grouparr[g];
                    var groupname = group.asc_getGroupName();
                    var funcarr = group.asc_getFormulasArray();

                    for (var f in funcarr) {
                        var func = funcarr[f];
                        var _name = func.asc_getName();
                        functions[_name] = {
                            type:       _name,
                            group:      groupname,
                            caption:    func.asc_getLocaleName(),
                            args:       jsonDescr[_name].a || '',
                            descr:      jsonDescr[_name].d || ''
                        };
                    }
                }

                this.getView('AddFunction').setFunctions(functions);
            },

            onInsertFunction: function (type) {
                SSE.getController('AddContainer').hideModal();

                this.api.asc_insertFormula(this.api.asc_getFormulaLocaleName(type), Asc.c_oAscPopUpSelectorType.Func, true);
            },

            onFunctionInfo: function (type) {
                this.getView('AddFunction').openFunctionInfo(type);
            }
        }
    })(), SSE.Controllers.AddFunction || {}))
});