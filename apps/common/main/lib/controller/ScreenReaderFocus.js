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
 *  ScreenReaderFocus.js
 *
 *  Created on 22.11.2023
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
        _unlockKeyEvents = false,
        _isDocReady = false,
        _isEditDiagram = false,
        _isSidePanelMode = false,
        _api,
        _app;

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
            // console.log(_currentControls);
        }
        if (!_focusVisible) {
            if ($('#file-menu-panel').is(':visible')) {
                _setFocusInActiveFileMenuItem();
            } else {
                _setFocusInActiveTab();
            }
        } else if (_currentLevel !== _lastLevel && (_currentLevel === 0 || _currentLevel === 1 && $('#file-menu-panel').is(':visible'))) {
            var id = $(_lastSection).prop('id');
            if (id === 'toolbar') {
                _setFocusInActiveTab();
            } else if (id === 'left-menu' || id === 'right-menu') {
                _setFocusInActiveCategory(id);
            } else if (id === 'file-menu-panel') {
                _setFocusInActiveFileMenuItem();
            }
        } else if (_currentLevel === 1 && _currentLevel !== _lastLevel && ($(_currentSection).prop('id') === 'left-menu' || $(_currentSection).prop('id') === 'right-menu')) {
            _setFocusInSideMenu($(_currentSection).prop('id') === 'left-menu');
        }
        var currItem = _currentControls[_currentItemIndex];
        // console.log(_currentControls[_currentItemIndex]);
        if (currItem) {
            if ($(currItem).parent().hasClass('ribtab') && !$(currItem).parent().hasClass('active') && $(currItem).data('tab') !== 'file') {
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
        _isSidePanelMode = false;
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
        var activeCategory;
        for (var i=0; i<_currentControls.length; i++) {
            var item = $(_currentControls[i]);
            if ($(item.closest('.hint-section')).prop('id') === id && item.hasClass('btn-category') && item.hasClass('active')) {
                activeCategory = _currentControls[i];
                break;
            }
        }
        if (activeCategory) {
            _currentItemIndex = i;
        }
    };

    var _setFocusInActiveFileMenuItem = function () {
        var activeItem;
        for (var i=0; i<_currentControls.length; i++) {
            if ($(_currentControls[i]).parent().hasClass('active')) {
                activeItem = _currentControls[i];
                break;
            }
        }
        if (activeItem) {
            _currentItemIndex = i;
        }
    };

    var _setFocusInSideMenu = function (isLeftMenu) {
        var index = 0,
            view, btn;
        if (isLeftMenu) {
            view = _app.getController('LeftMenu').getView('LeftMenu');
            btn = view.getFocusElement();
        }
        if (btn) {
            for (var i=0; i<_currentControls.length; i++) {
                if ($(_currentControls[i]).is($(btn))) {
                    index = i;
                    break;
                }
            }
        }
        _currentItemIndex = index;
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
        _app = window.DE || window.PE || window.SSE || window.PDFE;
        _isDocReady = true;

        if ( !Common.Utils.ScreeenReaderHelper ) {
            require(['common/main/lib/util/ScreenReaderHelper'], function () {
                Common.Utils.ScreeenReaderHelper.setEnabled(true);
            });
        }

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
            } else if (_unlockKeyEvents) {
                _lockedKeyEvents(false);
                _unlockKeyEvents = false;
            } else if (_focusVisible) {
                e.preventDefault();
            }
            _needShow = false;
        });
        $(document).on('keydown.after.bs.dropdown', function(e) {
            if (_focusVisible) {
                var tag = $(_currentControls[_currentItemIndex]).prop('tagName'),
                    isInputFocused = tag === 'INPUT' || tag === 'TEXTAREA',
                    isDirectionEvent = e.keyCode == Common.UI.Keys.TAB || e.keyCode == Common.UI.Keys.LEFT || e.keyCode == Common.UI.Keys.RIGHT ||
                        e.keyCode == Common.UI.Keys.UP || e.keyCode == Common.UI.Keys.DOWN,
                    isControlEvent = e.keyCode == Common.UI.Keys.ESC || e.keyCode == Common.UI.Keys.RETURN || e.keyCode == Common.UI.Keys.SPACE;
                if($(_currentControls[_currentItemIndex]).data('move-focus-only-tab') && e.keyCode !== Common.UI.Keys.TAB && !isControlEvent) return;
                if (!(isDirectionEvent || isControlEvent) || (e.keyCode == Common.UI.Keys.SPACE && isInputFocused)) return;
                if (isDirectionEvent) e.preventDefault(); // allow to write in inputs
                Common.UI.Menu.Manager.hideAll();
                var turnOffHints = false,
                    btn = _currentControls[_currentItemIndex] && $(_currentControls[_currentItemIndex]);
                var isFileMenu = $('#file-menu-panel').is(':visible'),
                    isBtnCategory = btn && btn.hasClass('btn-category'),
                    left = e.keyCode == Common.UI.Keys.LEFT,
                    right = e.keyCode == Common.UI.Keys.RIGHT,
                    up = e.keyCode == Common.UI.Keys.UP,
                    down = e.keyCode == Common.UI.Keys.DOWN,
                    tab = e.keyCode == Common.UI.Keys.TAB,
                    shiftTab = e.shiftKey && e.keyCode == Common.UI.Keys.TAB,
                    isPrevItem,
                    isNextItem,
                    isPrevLevel,
                    isNextLevel;
                if (isFileMenu) {
                    isPrevItem = left || up;
                    isNextItem = _currentLevel === 2 ? (right || down || tab && !shiftTab) : (right || down);
                    isPrevLevel = shiftTab;
                    isNextLevel = tab && !shiftTab;
                } else if (isBtnCategory) {
                    isPrevItem = up || shiftTab;
                    isNextItem = down || tab;
                    isPrevLevel = false;
                    isNextLevel = right || left;
                } else if (_isSidePanelMode) {
                    isPrevItem = shiftTab;
                    isNextItem = tab;
                    isPrevLevel = false;
                    isNextLevel = false;
                } else {
                    isPrevItem = left || shiftTab;
                    isNextItem = right || tab && !shiftTab;
                    isPrevLevel = up;
                    isNextLevel = down;
                }
                if (e.keyCode == Common.UI.Keys.ESC) {
                    _exitFocusMode();
                    return;
                } else if (e.keyCode == Common.UI.Keys.RETURN || e.keyCode == Common.UI.Keys.SPACE) {
                    if (btn) {
                        if (btn.attr('for')) { // to trigger event in checkbox
                            $('#' + btn.attr('for')).trigger(jQuery.Event('click', {which: 1}));
                        } else {
                            btn.trigger(jQuery.Event('click', {which: 1}));
                        }
                        if (btn.data('toggle') !== 'dropdown') btn.blur();
                    }
                    if (btn && btn.data('tab') === 'file' || isFileMenu && _currentLevel === 1) {
                        _nextLevel();
                        _setCurrentSection(btn);
                    } else if (btn && isBtnCategory && btn.hasClass('active')) {
                        _isSidePanelMode = true;
                        _nextLevel();
                        _setCurrentSection(btn);
                    } else {
                        _hideFocus();
                        _resetToDefault();
                        Common.UI.HintManager.isHintVisible() && Common.UI.HintManager.clearHints(false, true);
                        if (btn && btn.data('toggle') !== 'dropdown') _unlockKeyEvents = true;
                        _isLockedKeyEvents = false;
                        return;
                    }
                } else if (isPrevItem) {
                    turnOffHints = true;
                    _prevItem();
                } else if (isNextItem) {
                    turnOffHints = true;
                    _nextItem();
                } else if (isNextLevel) {
                    var attr = '[data-hint="' + (_currentLevel + 1) + '"]';
                    if ($(_currentSection).find(attr).length === 0 || btn && $(btn.closest('.hint-section')).find(attr).filter(':visible').length === 0) return;
                    turnOffHints = true;
                    _nextLevel();
                    _setCurrentSection(btn);
                    if (isBtnCategory) _isSidePanelMode = true;
                } else if (isPrevLevel) {
                    if (_currentLevel === 0) return;
                    turnOffHints = true;
                    _prevLevel();
                    _setCurrentSection(btn);
                }
                if (!_focusMode && turnOffHints) {
                    _focusMode = true;
                    Common.UI.HintManager.isHintVisible() && Common.UI.HintManager.clearHints(false, true);
                }
                _showFocus();
            }
        });
        $(document).on('keydown', function(e) {
            _needShow = e.keyCode == Common.UI.Keys.ALT && !e.shiftKey && !Common.Utils.ModalWindow.isVisible() && _isDocReady && !(window.PE && $('#pe-preview').is(':visible'));

            // Add outline style for focus elements for test
            if (Common.localStorage.getBool('screen-reader-focus-mode', false)) {
                !$(document.body).hasClass('focus-mode') && $(document.body).addClass('focus-mode');
            } else {
                $(document.body).hasClass('focus-mode') && $(document.body).removeClass('focus-mode');
            }
        });
    };

    var _isFocusMode = function () {
        return !!_focusMode;
    }

    return {
        init: _init,
        isFocusMode: _isFocusMode
    }
})();