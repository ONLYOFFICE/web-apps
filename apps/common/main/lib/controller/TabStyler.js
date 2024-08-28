/*
 * (c) Copyright Ascensio System SIA 2010-2024
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
 * You can contact Ascensio System SIA at 20A-6 Ernesta Birznieka-Upish
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
                value = Common.localStorage.getItem("settings-tab-style");
            } else if (value === undefined && _customization && (typeof _customization === 'object') && _customization.toolbarNoTabs) {
                value = 'line';
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
            })
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
            Common.localStorage.setItem('settings-tab-style', style);
            Common.Utils.InternalSettings.set('settings-tab-style', style);
            Common.NotificationCenter.trigger('tabstyle:changed', style);
        };

        var _setBackground = function(background) {
            Common.localStorage.setItem('settings-tab-background', background);
            Common.Utils.InternalSettings.set('settings-tab-background', background);
            Common.NotificationCenter.trigger('tabbackground:changed', background);
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
