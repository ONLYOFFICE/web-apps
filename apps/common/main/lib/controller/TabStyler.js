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
 * Created on 28/08/2024.
 */

define([
    'core'
], function () {
    'use strict';

    !Common.UI && (Common.UI = {});

    Common.UI.TabStyler = new(function() {
        var _customization,
            _canChangeStyle = true,
            _canChangeBackground = true;

        var _init = function (customization) {
            _customization = customization;
            _canChangeStyle = Common.UI.FeaturesManager.canChange('tabStyle', true);
            _canChangeBackground = !Common.Utils.isIE && Common.UI.FeaturesManager.canChange('tabBackground', true);

            var value = Common.UI.FeaturesManager.getInitValue('tabStyle', true);
            if ( _canChangeStyle && Common.localStorage.itemExists("settings-tab-style")) { // get from local storage
                var themeid = Common.UI.Themes.currentThemeId(),
                    isNew = themeid==='theme-system' || themeid==='theme-white' || themeid==='theme-night';
                value = isNew && !Common.localStorage.itemExists("settings-tab-style-newtheme") ? 'line' : Common.localStorage.getItem("settings-tab-style");
            } else if (value === undefined) {
                value = (_customization && (typeof _customization === 'object') && _customization.toolbarNoTabs) ? 'line' : Common.UI.Themes.getThemeProps('tab-style');
            }
            Common.Utils.InternalSettings.set("settings-tab-style", value || 'fill');

            value = Common.UI.FeaturesManager.getInitValue('tabBackground', true);
            if (_canChangeBackground && Common.localStorage.itemExists("settings-tab-background")) { // get from local storage
                value = Common.localStorage.getItem("settings-tab-background");
            } else if (value === undefined && _customization && (typeof _customization === 'object') && _customization.toolbarNoTabs) {
                value = 'toolbar';
            }
            Common.Utils.InternalSettings.set("settings-tab-background", value || 'header');
            _customization && (typeof _customization === 'object') && _customization.toolbarNoTabs &&
            console.log("Obsolete: The 'toolbarNoTabs' parameter of the 'customization' section is deprecated. Please use 'tabStyle' and 'tabBackground' parameters in the 'customization.features' section instead.");

            $(window).on('storage', function (e) {
                if ( e.key === 'settings-tab-style' && _canChangeStyle) {
                    _refreshStyle(e.originalEvent.newValue);
                } else if ( e.key === 'settings-tab-background' && _canChangeBackground) {
                    _refreshBackground(e.originalEvent.newValue);
                }
            });
            Common.NotificationCenter.on('uitheme:changed', _onThemeChanged);
        };

        var _refreshStyle = function() {
            if ( Common.localStorage.getItem('settings-tab-style') !== Common.Utils.InternalSettings.get("settings-tab-style") ) {
                const value = Common.localStorage.getItem('settings-tab-style');
                if ( value ) {
                    Common.Utils.InternalSettings.set('settings-tab-style', value);
                    Common.NotificationCenter.trigger('tabstyle:changed', value);
                }
            }
        };

        var _refreshBackground = function() {
            if ( Common.localStorage.getItem('settings-tab-background') !== Common.Utils.InternalSettings.get("settings-tab-background") ) {
                const value = Common.localStorage.getItem('settings-tab-background');
                if ( value ) {
                    Common.Utils.InternalSettings.set('settings-tab-background', value);
                    Common.NotificationCenter.trigger('tabbackground:changed', value);
                }
            }
        };

        var _setStyle = function(style) {
            if (style) {
                Common.localStorage.setItem('settings-tab-style', style);
                Common.Utils.InternalSettings.set('settings-tab-style', style);
            } else {
                style = Common.UI.FeaturesManager.getInitValue('tabStyle', true);
                if ( _canChangeStyle && Common.localStorage.itemExists("settings-tab-style")) { // get from local storage
                    var themeid = Common.UI.Themes.currentThemeId(),
                        isNew = themeid==='theme-system' || themeid==='theme-white' || themeid==='theme-night';
                    style = isNew && !Common.localStorage.itemExists("settings-tab-style-newtheme") ? 'line' : Common.localStorage.getItem("settings-tab-style");
                } else if (style === undefined) {
                    style = (_customization && (typeof _customization === 'object') && _customization.toolbarNoTabs) ? 'line' : Common.UI.Themes.getThemeProps('tab-style');
                }
                Common.Utils.InternalSettings.set("settings-tab-style", style || 'fill');
            }
            Common.NotificationCenter.trigger('tabstyle:changed', style);
        };

        var _setBackground = function(background) {
            Common.localStorage.setItem('settings-tab-background', background);
            Common.Utils.InternalSettings.set('settings-tab-background', background);
            Common.NotificationCenter.trigger('tabbackground:changed', background);
        };

        var _onThemeChanged = function() {
            _setStyle();
        };

        return {
            init: _init,
            setStyle: _setStyle,
            setBackground: _setBackground,
            refreshStyle: _refreshStyle,
            refreshBackground: _refreshBackground
        }
    })();
});
