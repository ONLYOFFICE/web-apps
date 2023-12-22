/*
 * (c) Copyright Ascensio System SIA 2010-2023
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
 *  ScreenReaderFocus.js
 *
 *  Created by Julia Svinareva on 22.11.2023
 *  Copyright (c) 2021 Ascensio System SIA. All rights reserved.
 *
 */


if (Common === undefined)
    var Common = {};

if (Common.UI === undefined) {
    Common.UI = {};
}

Common.UI.ScreenReaderFocusManager = new(function() {
    var _needShow = false,
        _focusVisible = false,
        _focusMode = false,
        _currentLevel = 0,
        _lastLevel = 0,
        _currentSection = document,
        _lastSection = document,
        _currentControls = [],
        _currentItemIndex,
        _isLockedKeyEvents = false,
        _isDocReady = false,
        _isEditDiagram = false,
        _api;

    var _setCurrentSection = function (btn, section) {
        _lastSection = _currentSection;
        if (section) {
            _currentSection = section;
            return;
        }
        if (btn === 'esc') {
            if (_currentLevel === 0) {
                _currentSection = document;
            }
            return;
        }
        if (_isEditDiagram) {
            _currentSection = [$(window.parent.document).find('.advanced-settings-dlg:visible')[0], window.document];
        } else if ($('#file-menu-panel').is(':visible')) {
            _currentSection = $('#file-menu-panel');
        } else {
            _currentSection = _currentLevel === 0 ? document : ((btn && btn.closest('.hint-section')) || document);
        }
    };

    var _lockedKeyEvents = function (isLocked) {
        if (_api) {
            _isLockedKeyEvents = isLocked;
            _api.asc_enableKeyEvents(!isLocked);
        }
    };

    var _showFocus = function () {
        if (_currentControls.length === 0 || ($('#file-menu-panel').is(':visible' || _isEditDiagram) && _currentLevel === 1)) {
            _getControls();
            console.log(_currentControls);
        }
        if (!_focusVisible) {
            _setFocusInActiveTab();
        } else if (_currentLevel !== _lastLevel && _currentLevel === 0) {
            var id = $(_lastSection).prop('id');
            if (id === 'toolbar') {
                _setFocusInActiveTab();
            } else if (id === 'left-menu' || id === 'right-menu') {
                _setFocusInActiveCategory(id);
            }
        }
        var currItem = _currentControls[_currentItemIndex];
        console.log(_currentControls[_currentItemIndex]);
        if (currItem) {
            if (($(currItem).hasClass('btn-category') && !$(currItem).hasClass('active') &&
                $(currItem).prop('id') !== 'left-btn-support' && $(currItem).prop('id') !== "left-btn-about") ||
                ($(currItem).parent().hasClass('ribtab') && !$(currItem).parent().hasClass('active') && $(currItem).data('tab') !== 'file')) {
                $(currItem).trigger(jQuery.Event('click', {which: 1}));
            }
            $(_currentControls[_currentItemIndex]).focus();
        }
        if (_currentControls.length > 0) {
            !_isLockedKeyEvents && _lockedKeyEvents(true);
            _focusVisible = true;
        } else {
            _focusVisible = false;
        }
    };

    var _hideFocus = function () {
        _focusVisible = false;
        _focusMode = false;
    };

    var _nextItem = function () {
        _lastLevel = _currentLevel;
        _currentItemIndex++;
        if (_currentItemIndex > _currentControls.length - 1) {
            _currentItemIndex = 0;
        }
    };

    var _prevItem = function () {
        _lastLevel = _currentLevel;
        _currentItemIndex--;
        if (_currentItemIndex < 0) {
            _currentItemIndex = _currentControls.length - 1;
        }
    };

    var _nextLevel = function(level) {
        _lastLevel = _currentLevel;
        _currentItemIndex = 0;
        _currentControls.length = 0;
        if (level !== undefined) {
            _currentLevel = level;
        } else {
            _currentLevel++;
        }
    };

    var _prevLevel = function() {
        _lastLevel = _currentLevel;
        _currentControls.length = 0;
        _currentLevel--;
    };

    var _resetToDefault = function() {
        _currentLevel = ($('#file-menu-panel').is(':visible') || _isEditDiagram) ? 1 : 0;
        _setCurrentSection();
        _currentControls.length = 0;
    };

    var _setFocusInActiveTab = function () {
        var activeTab;
        for (var i=0; i<_currentControls.length; i++) {
            var parent = $(_currentControls[i]).parent();
            if (parent && parent.hasClass('ribtab') && parent.hasClass('active')) {
                activeTab = _currentControls[i];
                break;
            }
        }
        if (activeTab) {
            _currentItemIndex = i;
        }
    };

    var _setFocusInActiveCategory = function (id) {
        var activeTab;
        for (var i=0; i<_currentControls.length; i++) {
            var item = $(_currentControls[i]);
            if ($(item.closest('.hint-section')).prop('id') === id && item.hasClass('btn-category') && item.hasClass('active')) {
                activeTab = _currentControls[i];
                break;
            }
        }
        if (activeTab) {
            _currentItemIndex = i;
        }
    };

    var _isItemDisabled = function (item) {
        return (item.hasClass('disabled') || item.parent().hasClass('disabled') || item.attr('disabled'));
    };

    var _getControls = function() {
        _currentControls = [];
        var arr = [];
        if (_.isArray(_currentSection)) {
            _currentSection.forEach(function (section) {
                arr = arr.concat($(section).find('[data-hint=' + (_currentLevel) + ']').toArray());
            });
        } else {
            arr = $(_currentSection).find('[data-hint=' + (_currentLevel) + ']').toArray();
        }
        _currentControls = arr.filter(function (item) {
            return ($(item).is(':visible') && !_isItemDisabled($(item)));
        });
        _currentControls.forEach(function (item) {
            if ($(item).attr("tabindex") === undefined) $(item).attr("tabindex", 0);
        });
    };

    var _exitFocusMode = function () {
        _hideFocus();
        _resetToDefault();
        _isLockedKeyEvents && _lockedKeyEvents(false);
    };

    var _init = function(api) {
        if (Common.Utils.isIE || Common.UI.isMac && Common.Utils.isGecko) // turn off hints on IE and FireFox (shortcut F6 selects link in address bar)
            return;
        _api = api;

        Common.NotificationCenter.on({
            'app:ready': function (mode) {
                _isDocReady = true;

                if ( !Common.Utils.ScreeenReaderHelper ) {
                    require(['common/main/lib/util/ScreenReaderHelper'], function () {
                        Common.Utils.ScreeenReaderHelper.setEnabled(true);
                    });
                }
            }
        });
        $('#editor_sdk').on('click', function () {
            _exitFocusMode();
        });
        $(document).on('mousedown', function () {
            _exitFocusMode();
        });
        $(document).on('keyup', function(e) {
            if ((e.keyCode == Common.UI.Keys.ALT || e.keyCode === 91) && _needShow && !(window.SSE && window.SSE.getController('Statusbar').getIsDragDrop())) {
                e.preventDefault();
                if (!_focusVisible) {
                    $('input:focus').blur(); // to change value in inputField
                    _currentLevel = ($('#file-menu-panel').is(':visible') || _isEditDiagram) ? 1 : 0;
                    _setCurrentSection();
                    _showFocus();
                } else {
                    _exitFocusMode();
                }
            } else if (_focusVisible) {
                e.preventDefault();
            }
            _needShow = false;
        });
        $(document).on('keydown.after.bs.dropdown', function(e) {
            if (_focusVisible) {
                if($(_currentControls[_currentItemIndex]).data('move-focus-only-tab') && e.keyCode !== Common.UI.Keys.TAB) return;
                var turnOffHints = false,
                    btn = _currentControls[_currentItemIndex] && $(_currentControls[_currentItemIndex]);
                e.preventDefault();
                Common.UI.Menu.Manager.hideAll();
                if (e.keyCode == Common.UI.Keys.ESC ) {
                    _exitFocusMode();
                    return;
                } else if (e.keyCode == Common.UI.Keys.RETURN || e.keyCode == Common.UI.Keys.SPACE) {
                    if (btn) {
                        btn.trigger(jQuery.Event('click', {which: 1}));
                    }
                    _hideFocus();
                    _resetToDefault();
                    //_lockedKeyEvents(false);
                    Common.UI.HintManager.isHintVisible() && Common.UI.HintManager.clearHints(false, true);
                    return;
                } else if (e.keyCode == Common.UI.Keys.LEFT) {
                    turnOffHints = true;
                    _prevItem();
                    Common.Utils.ScreeenReaderHelper.speech('previous item');
                } else if (e.keyCode == Common.UI.Keys.RIGHT || e.keyCode == Common.UI.Keys.TAB) {
                    turnOffHints = true;
                    _nextItem();
                    Common.Utils.ScreeenReaderHelper.speech('next item');
                } else if (e.keyCode == Common.UI.Keys.DOWN) {
                    var attr = '[data-hint="' + (_currentLevel + 1) + '"]';
                    if ($(_currentSection).find(attr).length === 0) return;
                    turnOffHints = true;
                    _nextLevel();
                    _setCurrentSection(btn);
                    Common.Utils.ScreeenReaderHelper.speech('next level');
                } else if (e.keyCode == Common.UI.Keys.UP) {
                    if (_currentLevel === 0) return;
                    turnOffHints = true;
                    _prevLevel();
                    _setCurrentSection(btn);
                    Common.Utils.ScreeenReaderHelper.speech('previous level');
                }
                if (!_focusMode && turnOffHints) {
                    _focusMode = true;
                    Common.UI.HintManager.isHintVisible() && Common.UI.HintManager.clearHints(false, true);
                }
                _showFocus();
            }
            _needShow = e.keyCode == Common.UI.Keys.ALT && !e.shiftKey && !Common.Utils.ModalWindow.isVisible() && _isDocReady && !(window.PE && $('#pe-preview').is(':visible'));
        });
    };

    return {
        init: _init
    }
})();