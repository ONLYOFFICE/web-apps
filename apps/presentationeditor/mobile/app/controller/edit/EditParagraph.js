/*
 *
 * (c) Copyright Ascensio System Limited 2010-2016
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
 *  EditParagraph.js
 *  Presentation Editor
 *
 *  Created by Alexander Yuzhin on 10/14/16
 *  Copyright (c) 2016 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'presentationeditor/mobile/app/view/edit/EditParagraph'
], function (core) {
    'use strict';

    PE.Controllers.EditParagraph = Backbone.Controller.extend(_.extend((function() {
        // Private
        var _stack = [],
            _paragraphInfo = {},
            _paragraphObject = undefined,
            metricText = Common.Utils.Metric.getCurrentMetricName();

        return {
            models: [],
            collections: [],
            views: [
                'EditParagraph'
            ],

            initialize: function () {
                Common.NotificationCenter.on('editcontainer:show', _.bind(this.initEvents, this));
                Common.NotificationCenter.on('editcategory:show',  _.bind(this.categoryShow, this));

                this.addListeners({
                    'EditParagraph': {
                        'page:show' : this.onPageShow
                    }
                });
            },

            setApi: function (api) {
                var me = this;
                me.api = api;
                me.api.asc_registerCallback('asc_onFocusObject',        _.bind(me.onApiFocusObject, me));
                me.api.asc_registerCallback('asc_onListType',           _.bind(me.onApiBullets, me));
                me.api.asc_registerCallback('asc_onPrAlign',            _.bind(me.onApiParagraphAlign, me));
                me.api.asc_registerCallback('asc_canIncreaseIndent',      _.bind(me.onApiCanIncreaseIndent, me));
                me.api.asc_registerCallback('asc_canDecreaseIndent',      _.bind(me.onApiCanDecreaseIndent, me));
                me.api.asc_registerCallback('asc_onLineSpacing',          _.bind(me.onApiLineSpacing, me));
                me.api.asc_registerCallback('asc_onVerticalTextAlign',    _.bind(me.onApiVerticalTextAlign, me));

            },

            onLaunch: function () {
                this.createView('EditParagraph').render();
            },

            initEvents: function () {
                var me = this;

                $('#paragraph-align .button').single('click',   _.bind(me.onParagraphAlign, me));
                $('#paragraph-valign .button').single('click',   _.bind(me.onParagraphVAlign, me));
                $('#font-moveleft, #font-moveright').single('click',   _.bind(me.onParagraphMove, me));

                $('#paragraph-distance-before .button').single('click',         _.bind(me.onDistanceBefore, me));
                $('#paragraph-distance-after .button').single('click',          _.bind(me.onDistanceAfter, me));

                me.initSettings();
            },

            categoryShow: function (e) {
                var $target = $(e.currentTarget);

                if ($target && $target.prop('id') === 'edit-paragraph') {
                    this.initSettings();
                }
            },

            onPageShow: function (view, pageId) {
                var me = this;

                $('#page-text-linespacing li').single('click',  _.buffered(me.onLineSpacing, 100, me));
                $('.dataview.bullets li').single('click',       _.buffered(me.onBullet, 100, me));
                $('.dataview.numbers li').single('click',       _.buffered(me.onNumber, 100, me));

                me.initSettings(pageId);
            },

            initSettings: function (pageId) {
                var me = this;

                me.api && me.api.UpdateInterfaceState();

                if (_paragraphObject) {
                    _paragraphInfo.spaceBefore = _paragraphObject.get_Spacing().get_Before() < 0 ? _paragraphObject.get_Spacing().get_Before() : Common.Utils.Metric.fnRecalcFromMM(_paragraphObject.get_Spacing().get_Before());
                    _paragraphInfo.spaceAfter  = _paragraphObject.get_Spacing().get_After() < 0 ? _paragraphObject.get_Spacing().get_After() : Common.Utils.Metric.fnRecalcFromMM(_paragraphObject.get_Spacing().get_After());
                    $('#paragraph-distance-before .item-after label').text(_paragraphInfo.spaceBefore < 0 ? 'Auto' : _paragraphInfo.spaceBefore + ' ' + metricText);
                    $('#paragraph-distance-after .item-after label').text(_paragraphInfo.spaceAfter < 0 ? 'Auto' : _paragraphInfo.spaceAfter + ' ' + metricText);
                }
            },

            // Handlers
            onParagraphAlign: function (e) {
                var $target = $(e.currentTarget);

                if ($target) {
                    var id = $target.attr('id'),
                        type = 1;

                    if ('font-just' == id) {
                        type = 3;
                    } else if ('font-right' == id) {
                        type = 0;
                    } else if ('font-center' == id) {
                        type = 2;
                    }

                    $('#paragraph-align .button').removeClass('active');
                    $target.addClass('active');

                    this.api.put_PrAlign(type);
                }
            },

            onParagraphVAlign: function (e) {
                var $target = $(e.currentTarget);

                if ($target) {
                    var id = $target.attr('id'),
                        type = Asc.c_oAscVAlign.Bottom;

                    if ('font-top' == id) {
                        type = Asc.c_oAscVAlign.Top;
                    } else if ('font-middle' == id) {
                        type = Asc.c_oAscVAlign.Center;
                    }

                    $('#paragraph-align .button').removeClass('active');
                    $target.addClass('active');

                    this.api.setVerticalAlign(type);
                }
            },

            onParagraphMove: function (e) {
                var $target = $(e.currentTarget);

                if ($target && this.api) {
                    var id = $target.attr('id');

                    if ('font-moveleft' == id) {
                        this.api.DecreaseIndent();
                    } else {
                        this.api.IncreaseIndent();
                    }
                }
            },

            onLineSpacing: function (e) {
                var $target = $(e.currentTarget).find('input');

                if ($target && this.api) {
                    var value = parseFloat($target.prop('value')),
                        LINERULE_AUTO = 1;

                    this.api.put_PrLineSpacing(LINERULE_AUTO, value);
                }
            },

            onBullet: function (e) {
                var $bullet = $(e.currentTarget),
                    type = $bullet.data('type');

                $('.dataview.bullets li').removeClass('active');
                $bullet.addClass('active');

                this.api.put_ListType(0, parseInt(type));
            },

            onNumber: function (e) {
                var $number = $(e.currentTarget),
                    type = $number.data('type');

                $('.dataview.numbers li').removeClass('active');
                $number.addClass('active');

                this.api.put_ListType(1, parseInt(type));
            },

            onDistanceBefore: function (e) {
                var $button = $(e.currentTarget),
                    distance = _paragraphInfo.spaceBefore;

                if ($button.hasClass('decrement')) {
                    distance = Math.max(-1, --distance);
                } else {
                    distance = Math.min(100, ++distance);
                }

                _paragraphInfo.spaceBefore = distance;

                $('#paragraph-distance-before .item-after label').text(_paragraphInfo.spaceBefore < 0 ? 'Auto' : (_paragraphInfo.spaceBefore) + ' ' + metricText);

                this.api.put_LineSpacingBeforeAfter(0, (_paragraphInfo.spaceBefore < 0) ? -1 : Common.Utils.Metric.fnRecalcToMM(_paragraphInfo.spaceBefore));
            },

            onDistanceAfter: function (e) {
                var $button = $(e.currentTarget),
                    distance = _paragraphInfo.spaceAfter;

                if ($button.hasClass('decrement')) {
                    distance = Math.max(-1, --distance);
                } else {
                    distance = Math.min(100, ++distance);
                }

                _paragraphInfo.spaceAfter = distance;

                $('#paragraph-distance-after .item-after label').text(_paragraphInfo.spaceAfter < 0 ? 'Auto' : (_paragraphInfo.spaceAfter) + ' ' + metricText);

                this.api.put_LineSpacingBeforeAfter(1, (_paragraphInfo.spaceAfter < 0) ? -1 : Common.Utils.Metric.fnRecalcToMM(_paragraphInfo.spaceAfter));
            },

            // API handlers

            onApiFocusObject: function (objects) {
                _stack = objects;

                var paragraphs = [];

                _.each(_stack, function(object) {
                    if (object.get_ObjectType() == Asc.c_oAscTypeSelectElement.Paragraph) {
                        paragraphs.push(object);
                    }
                });

                if (paragraphs.length > 0) {
                    var object = paragraphs[paragraphs.length - 1]; // get top
                    _paragraphObject = object.get_ObjectValue();
                } else {
                    _paragraphObject = undefined;
                }
            },

            onApiBullets: function(data) {
                var type    = data.get_ListType(),
                    subtype = data.get_ListSubType();

                switch (type) {
                    case 0:
                        $('.dataview.bullets li[data-type=' + subtype + ']').addClass('active');
                        break;
                    case 1:
                        $('.dataview.numbers li[data-type=' + subtype + ']').addClass('active');
                        break;
                }
            },

            onApiParagraphAlign: function(align) {
                $('#font-right').toggleClass('active', align===0);
                $('#font-left').toggleClass('active', align===1);
                $('#font-center').toggleClass('active', align===2);
                $('#font-just').toggleClass('active', align===3);
            },

            onApiVerticalTextAlign: function(align) {
                $('#font-top').toggleClass('active', align===Asc.c_oAscVAlign.Top);
                $('#font-middle').toggleClass('active', align===Asc.c_oAscVAlign.Center);
                $('#font-bottom').toggleClass('active', align===Asc.c_oAscVAlign.Bottom);
            },

            onApiLineSpacing: function(vc) {
                var line = (vc.get_Line() === null || vc.get_LineRule() === null || vc.get_LineRule() != 1) ? -1 : vc.get_Line();

                $('#page-text-linespacing input').val([line]);
            },


            onApiCanIncreaseIndent: function(value) {
                $('#font-moveright').toggleClass('disabled', !value);
            },

            onApiCanDecreaseIndent: function(value) {
                $('#font-moveleft').toggleClass('disabled', !value);
            }
        }
    })(), PE.Controllers.EditParagraph || {}))
});