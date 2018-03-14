/*
 *
 * (c) Copyright Ascensio System Limited 2010-2018
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
 *  EditSlide.js
 *  Presentation Editor
 *
 *  Created by Julia Radzhabova on 12/07/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'presentationeditor/mobile/app/view/edit/EditSlide',
    'jquery',
    'underscore',
    'backbone'
], function (core, view, $, _, Backbone) {
    'use strict';

    PE.Controllers.EditSlide = Backbone.Controller.extend(_.extend((function() {
        // Private
        var _stack = [],
            _slideObject = undefined,
            _themes = [],
            _themeId = -1,
            _effect = Asc.c_oAscSlideTransitionTypes.None,
            _effectType = -1,
            _effectDuration = 2000,
            _effectDelay = 10000;

        return {
            models: [],
            collections: [],
            views: [
                'EditSlide'
            ],

            initialize: function () {
                Common.NotificationCenter.on('editcontainer:show', _.bind(this.initEvents, this));
                Common.NotificationCenter.on('slidelayouts:load',  _.bind(this.updateLayouts, this));

                this.addListeners({
                    'EditSlide': {
                        'page:show': this.onPageShow
                    }
                });

                var me = this;
                uiApp.onPageBack('editslide-effect-type editslide-effect', function (page) {
                    me.initSettings('#edit-slide-transition');
                });
            },

            setApi: function (api) {
                var me = this;
                me.api = api;

                me.api.asc_registerCallback('asc_onFocusObject',        _.bind(me.onApiFocusObject, me));
                me.api.asc_registerCallback('asc_onInitEditorStyles',   _.bind(me.onApiInitEditorStyles, me));
                me.api.asc_registerCallback('asc_onUpdateThemeIndex',   _.bind(me.onApiUpdateThemeIndex, me));
            },

            onLaunch: function () {
                this.createView('EditSlide').render();
            },

            initEvents: function () {
                var me = this;

                $('#slide-remove').single('click', _.bind(me.onRemoveSlide, me));
                $('#slide-duplicate').single('click', _.bind(me.onDuplicateSlide, me));

                me.initSettings();
            },

            onPageShow: function (view, pageId) {
                var me = this;
                me.initSettings(pageId);
            },

            initSettings: function (pageId) {
                var me = this;

                if (_slideObject) {
                    if (pageId == '#edit-slide-style') {
                        me._initStyleView();

                        var paletteFillColor = me.getView('EditSlide').paletteFillColor;
                        paletteFillColor && paletteFillColor.on('select', _.bind(me.onFillColor, me));

                    } else if (pageId == '#edit-slide-layout') {
                        $('.container-edit .slide-layout li').single('click',  _.buffered(me.onLayoutClick, 100, me));
                    } else if (pageId == '#edit-slide-theme') {
                        this.getView('EditSlide').renderThemes();

                        $('.container-edit .slide-theme .row div').removeClass('active').single('click',  _.buffered(me.onThemeClick, 100, me));
                        $('.container-edit .slide-theme div[data-type=' + _themeId + ']').addClass('active');
                    } else if (pageId == '#edit-slide-transition') {
                        me._initTransitionView();
                        $('#slide-apply-all').single('click',                        _.bind(me.onApplyAll, me));

                        $('#edit-slide-duration .button').single('click',            _.bind(me.onDuration, me));
                        $('#edit-slide-start-click input:checkbox').single('change', _.bind(me.onStartClick, me));

                        $('#edit-slide-delay input:checkbox').single('change',       _.bind(me.onDelayCheck, me));
                        $('#edit-slide-delay .item-content:nth-child(2) input').single('change touchend', _.buffered(me.onDelay, 100, me));
                        $('#edit-slide-delay .item-content:nth-child(2) input').single('input',           _.bind(me.onDelayChanging, me));
                    } else if (pageId == '#editslide-effect') {
                        $('#page-editslide-effect input').val([_effect]);
                        $('#page-editslide-effect li').single('click',  _.buffered(me.onEffectClick, 100, me));
                    } else if (pageId == '#editslide-effect-type') {
                        me.getView('EditSlide').renderEffectTypes();
                        $('#page-editslide-effect-type input').val([_effectType]);
                        $('#page-editslide-effect-type li').single('click',  _.buffered(me.onEffectTypeClick, 100, me));
                    }
                }
            },

            _initStyleView: function () {
                var me = this,
                    paletteFillColor = me.getView('EditSlide').paletteFillColor;

                var sdkColor, color;

                // Init fill color
                var fill = _slideObject.get_background(),
                    fillType = fill.get_type();

                color = 'transparent';

                if (fillType == Asc.c_oAscFill.FILL_TYPE_SOLID) {
                    fill = fill.get_fill();
                    sdkColor = fill.get_color();

                    if (sdkColor) {
                        if (sdkColor.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                            color = {color: Common.Utils.ThemeColor.getHexColor(sdkColor.get_r(), sdkColor.get_g(), sdkColor.get_b()), effectValue: sdkColor.get_value()};
                        } else {
                            color = Common.Utils.ThemeColor.getHexColor(sdkColor.get_r(), sdkColor.get_g(), sdkColor.get_b());
                        }
                    }
                }

                paletteFillColor && paletteFillColor.select(color);
            },

            _initTransitionView: function () {
                var me = this;

                var timing = _slideObject.get_timing();
                if (timing) {
                    _effect = timing.get_TransitionType();
                    me.getView('EditSlide').fillEffectTypes(_effect);
                    $('#edit-slide-effect .item-after').text(me.getView('EditSlide').getEffectName(_effect));
                    $('#edit-slide-effect-type').toggleClass('disabled', _effect == Asc.c_oAscSlideTransitionTypes.None);
                    $('#edit-slide-duration').toggleClass('disabled', _effect == Asc.c_oAscSlideTransitionTypes.None);

                    _effectType = timing.get_TransitionOption();
                    $('#edit-slide-effect-type .item-after').text((_effect != Asc.c_oAscSlideTransitionTypes.None) ? me.getView('EditSlide').getEffectTypeName(_effectType) : '');

                    _effectDuration = timing.get_TransitionDuration();
                    $('#edit-slide-duration .item-after label').text((_effectDuration!==null && _effectDuration!==undefined) ?  (parseInt(_effectDuration/1000.) + ' ' + me.textSec) : '');

                    $('#edit-slide-start-click input:checkbox').prop('checked', !!timing.get_SlideAdvanceOnMouseClick());
                    $('#edit-slide-delay input:checkbox').prop('checked', !!timing.get_SlideAdvanceAfter());
                    $('#edit-slide-delay .item-content:nth-child(2)').toggleClass('disabled',!timing.get_SlideAdvanceAfter());

                    _effectDelay = timing.get_SlideAdvanceDuration();
                    $('#edit-slide-delay .item-content:nth-child(2) .item-after').text((_effectDelay!==null && _effectDelay!==undefined) ? (parseInt(_effectDelay/1000.) + ' ' + me.textSec) : '');
                    $('#edit-slide-delay .item-content:nth-child(2) input').val([(_effectDelay!==null && _effectDelay!==undefined) ? parseInt(_effectDelay/1000.) : 0]);
                }
            },

            // Public

            getSlide: function () {
                return _slideObject;
            },

            getThemes: function () {
                return _themes || [];
            },

            // Handlers

            onLayoutClick: function (e) {
                var me = this,
                    $target = $(e.currentTarget),
                    type = $target.data('type');

                me.api.ChangeLayout(type);
            },

            onThemeClick: function (e) {
                var me = this,
                    $target = $(e.currentTarget),
                    type = $target.data('type');

                $('.container-edit .slide-theme div').removeClass('active');
                $target.addClass('active');

                me.api.ChangeTheme(type);
            },

            onRemoveSlide: function () {
                this.api.DeleteSlide();
                PE.getController('EditContainer').hideModal();
            },

            onDuplicateSlide: function () {
                this.api.DublicateSlide();
                PE.getController('EditContainer').hideModal();
            },

            onFillColor: function(palette, color) {
                var me = this;

                if (me.api) {
                    var props = new Asc.CAscSlideProps();
                    var fill = new Asc.asc_CShapeFill();

                    if (color == 'transparent') {
                        fill.put_type(Asc.c_oAscFill.FILL_TYPE_NOFILL);
                        fill.put_fill(null);
                    } else {
                        fill.put_type(Asc.c_oAscFill.FILL_TYPE_SOLID);
                        fill.put_fill(new Asc.asc_CFillSolid());
                        fill.get_fill().put_color(Common.Utils.ThemeColor.getRgbColor(color));
                    }
                    props.put_background(fill);
                    me.api.SetSlideProps(props);
                }
            },

            updateLayouts: function(layouts){
                this.getView('EditSlide').updateLayouts();
                $('.container-edit .slide-layout li').single('click',  _.buffered(this.onLayoutClick, 100, this));
            },

            onEffectClick: function (e) {
                var $target = $(e.currentTarget).find('input');

                if ($target && this.api) {
                    _effect = parseFloat($target.prop('value'));
                    _effectType = this.getView('EditSlide').fillEffectTypes(_effect);

                    var props = new Asc.CAscSlideProps(),
                        timing = new Asc.CAscSlideTiming();
                    timing.put_TransitionType(_effect);
                    timing.put_TransitionOption(_effectType);
                    props.put_timing(timing);
                    this.api.SetSlideProps(props);
                }
            },

            onEffectTypeClick: function (e) {
                var $target = $(e.currentTarget).find('input');

                if ($target && this.api) {
                    _effectType = parseFloat($target.prop('value'));

                    var props = new Asc.CAscSlideProps(),
                        timing = new Asc.CAscSlideTiming();
                    timing.put_TransitionType(_effect);
                    timing.put_TransitionOption(_effectType);
                    props.put_timing(timing);
                    this.api.SetSlideProps(props);
                }
            },

            onDuration: function (e) {
                var $button = $(e.currentTarget),
                    duration = parseInt(_effectDuration/1000);

                if ($button.hasClass('decrement')) {
                    duration = Math.max(0, --duration);
                } else {
                    duration = Math.min(300, ++duration);
                }
                _effectDuration = duration * 1000;
                $('#edit-slide-duration .item-after label').text(duration + ' ' + this.textSec);

                var props = new Asc.CAscSlideProps(),
                    timing = new Asc.CAscSlideTiming();
                timing.put_TransitionDuration(_effectDuration);
                props.put_timing(timing);
                this.api.SetSlideProps(props);
            },

            onStartClick: function (e) {
                var $checkbox = $(e.currentTarget);

                var props = new Asc.CAscSlideProps(),
                    timing = new Asc.CAscSlideTiming();
                timing.put_SlideAdvanceOnMouseClick($checkbox.is(':checked'));
                props.put_timing(timing);
                this.api.SetSlideProps(props);
            },

            onDelayCheck: function (e) {
                var $checkbox = $(e.currentTarget);

                $('#edit-slide-delay .item-content:nth-child(2)').toggleClass('disabled',!$checkbox.is(':checked'));

                var props = new Asc.CAscSlideProps(),
                    timing = new Asc.CAscSlideTiming();
                timing.put_SlideAdvanceAfter($checkbox.is(':checked'));
                timing.put_SlideAdvanceDuration(_effectDelay);
                props.put_timing(timing);
                this.api.SetSlideProps(props);
            },

            onDelay: function (e) {
                var $target = $(e.currentTarget),
                    delay = $target.val();

                _effectDelay = delay * 1000;
                $('#edit-slide-delay .item-content:nth-child(2) .item-after').text(delay + ' ' + this.textSec);

                var props = new Asc.CAscSlideProps(),
                    timing = new Asc.CAscSlideTiming();
                timing.put_SlideAdvanceDuration(_effectDelay);
                props.put_timing(timing);
                this.api.SetSlideProps(props);
            },

            onDelayChanging: function (e) {
                var $target = $(e.currentTarget);
                $('#edit-slide-delay .item-content:nth-child(2) .item-after').text($target.val() + ' ' + this.textSec);
            },

            onApplyAll: function (e) {
                this.api.SlideTimingApplyToAll();
            },

            // API handlers

            onApiFocusObject: function (objects) {
                _stack = objects;

                var slides = [];

                _.each(_stack, function (object) {
                    if (object.get_ObjectType() == Asc.c_oAscTypeSelectElement.Slide) {
                        slides.push(object);
                    }
                });

                if (slides.length > 0) {
                    var object = slides[slides.length - 1]; // get top slide
                    _slideObject = object.get_ObjectValue();
                } else {
                    _slideObject = undefined;
                }
            },

            onApiInitEditorStyles: function(themes) {
                if (themes) {
                    window.styles_loaded = false;

                    var me = this,
                        defaultThemes = themes[0] || [],
                        docThemes     = themes[1] || [];

                    _themes = [];

                    _.each(defaultThemes.concat(docThemes), function(theme) {
                        _themes.push({
                            imageUrl: theme.get_Image(),
                            themeId : theme.get_Index()
                        });
                    });

                    window.styles_loaded = true;
                }
            },

            onApiUpdateThemeIndex: function(themeId) {
                _themeId = themeId;
                $('.container-edit .slide-theme .row div').removeClass('active');
                $('.container-edit .slide-theme div[data-type=' + _themeId + ']').addClass('active');
            },

            // Helpers

            _closeIfNeed: function () {
                if (!this._isSlideInStack()) {
                    PE.getController('EditContainer').hideModal();
                }
            },

            _isSlideInStack: function () {
                var slideExist = false;

                _.some(_stack, function(object) {
                    if (object.get_ObjectType() == Asc.c_oAscTypeSelectElement.Slide) {
                        slideExist = true;
                        return true;
                    }
                });

                return slideExist;
            },

            textSec: 's'
        };
    })(), PE.Controllers.EditSlide || {}))
});