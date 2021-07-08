/*
 *
 * (c) Copyright Ascensio System SIA 2010-2021
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
 *  HintManager.js
 *
 *  Created by Julia Radzhabova on 21.04.2021
 *  Copyright (c) 2021 Ascensio System SIA. All rights reserved.
 *
 */


if (Common === undefined)
    var Common = {};

if (Common.UI === undefined) {
    Common.UI = {};
}

Common.UI.HintManager = new(function() {
    var _lang = 'en',
        _arrAlphabet = [],
        _arrEnAlphabet = [],
        _arrQwerty = [],
        _arrEnQwerty = [],
        _isAlt = false,
        _hintVisible = false,
        _currentLevel = 0,
        _currentSection = document,
        _currentControls = [],
        _currentHints = [],
        _inputLetters = '',
        _isClear = false;

    var _setCurrentSection = function (btn) {
        if (btn === 'esc') {
            if (_currentLevel === 0) {
                _currentSection = document;
            }
            return;
        }
        if ($('#file-menu-panel').is(':visible')) {
            _currentSection = $('#file-menu-panel');
        } else {
            _currentSection = (btn && btn.closest('.hint-section')) || document;
        }
    };

    var _showHints = function () {
        _inputLetters = '';
        if (_currentHints.length === 0 || ($('#file-menu-panel').is(':visible') && _currentLevel === 1)) {
            _getHints();
        }
        if (_currentHints.length > 0) {
            _hintVisible = true;
            _currentHints.forEach(function(item) {
                item.show();
            });
        } else
            _hintVisible = false;
    };

    var _hideHints = function() {
        _hintVisible = false;
        _currentHints && _currentHints.forEach(function(item) {
            item.hide()
        });
    };

    var _nextLevel = function() {
        _removeHints();
        _currentHints.length = 0;
        _currentControls.length = 0;
        _currentLevel++;
    };

    var _prevLevel = function() {
        _removeHints();
        _currentHints.length = 0;
        _currentControls.length = 0;
        _currentLevel--;
    };

    var _getLetters = function(countButtons) {
        var arr = [..._arrAlphabet];
        arr[0] = _arrAlphabet[0].repeat(2);
        for (var i = 1; arr.length < countButtons; i++) {
            arr.push(_arrAlphabet[0] + _arrAlphabet[i]);
        }
        return arr;
    };

    var _isItemDisabled = function (item) {
        return (item.hasClass('disabled') || item.parent().hasClass('disabled') || item.attr('disabled'));
    };

    var _getControls = function() {
        _currentControls = [];
        var arr = $(_currentSection).find('[data-hint=' + (_currentLevel) + ']').toArray();
        var visibleItems = arr.filter(function (item) {
            return $(item).is(':visible');
        });
        var visibleItemsWithTitle = $(_currentSection).find('[data-hint-title][data-hint=' + (_currentLevel) + ']').toArray().filter(function (item) {
            return $(item).is(':visible');
        });
        if (visibleItems.length === visibleItemsWithTitle.length) { // all buttons have data-hint-title
            visibleItems.forEach(function (item) {
                var el = $(item);
                _currentControls.push(el);
            });
            return;
        }
        var _arrLetters = [];
        if (visibleItems.length > _arrAlphabet.length) {
            _arrLetters = _getLetters(visibleItems.length);
        } else {
            _arrLetters = [..._arrAlphabet];
        }
        var usedLetters = [];
        if ($(_currentSection).find('[data-hint-title]').length > 0) {
            visibleItems.forEach(function (item) {
                var el = $(item);
                var title = el.attr('data-hint-title');
                if (title) {
                    var ind = _arrEnAlphabet.indexOf(title.toLowerCase());
                    if (ind === -1) { // we have already changed
                        usedLetters.push(_arrAlphabet.indexOf(title.toLowerCase()));
                    } else {
                        usedLetters.push(ind);
                        if (_lang !== 'en') {
                            el.attr('data-hint-title', _arrLetters[ind].toUpperCase());
                        }
                    }
                }
            });
        }
        var index = 0;
        visibleItems.forEach(function (item) {
            var el = $(item);
            while (usedLetters.indexOf(index) !== -1) {
                index++;
            }
            var title = el.attr('data-hint-title');
            if (!title) {
                el.attr('data-hint-title', _arrLetters[index].toUpperCase());
                index++;
            }
            _currentControls.push(el);
        });
    };

    var _getHints = function() {
        if (_currentControls.length === 0)
            _getControls();
        _currentControls.forEach(function(item, index) {
            if (!_isItemDisabled(item)) {
                if ($(_currentSection).prop('id') === 'toolbar' && ($(_currentSection).find('.toolbar-mask').length > 0 || item.closest('.group').find('.toolbar-group-mask').length > 0)) {
                    return;
                }
                if (window.SSE && item.parent().prop('id') === 'statusbar_bottom') {
                    var $statusbar = item.parent();
                    if (item.offset().left > $statusbar.offset().left + $statusbar.width()) {
                        return;
                    }
                }
                var hint = $('<div style="" class="hint-div">' + item.attr('data-hint-title') + '</div>');
                var direction = item.attr('data-hint-direction');
                // exceptions
                if (window.SSE && _currentSection.nodeType !== 9 &&
                    _currentSection.prop('id') === 'toolbar' && item.closest('.panel').attr('data-tab') === 'data') {
                    if (item.parent().hasClass('slot-sortdesc') || item.parent().hasClass('slot-btn-setfilter')) {
                        direction = 'top';
                        item.attr('data-hint-direction', 'top');
                    } else if (item.parent().hasClass('slot-btn-clear-filter') || item.parent().hasClass('slot-sortasc')) {
                        direction = 'bottom';
                        item.attr('data-hint-direction', 'bottom');
                    }
                }
                var offsets = item.attr('data-hint-offset');
                var applyOffset = offsets === 'big' ? 6 : (offsets === 'medium' ? 4 : (offsets === 'small' ? 2 : 0));
                if (applyOffset) {
                    switch (direction) {
                        case 'bottom':
                            offsets = [-applyOffset, 0];
                            break;
                        case 'top':
                            offsets = [applyOffset, 0];
                            break;
                        case 'right':
                            offsets = [0, -applyOffset];
                            break;
                        case 'left':
                            offsets = [0, applyOffset];
                            break;
                    }
                } else {
                    offsets = offsets ? item.attr('data-hint-offset').split(',').map((item) => (parseInt(item))) : [0, 0];
                }
                var offset = item.offset();
                if (direction === 'left-top')
                    hint.css({
                        top: offset.top - 10 + offsets[0],
                        left: offset.left - 10 + offsets[1]
                    });
                else if (direction === 'top')
                    hint.css({
                        top: offset.top - 18 + offsets[0],
                        left: offset.left + (item.outerWidth() - 18) / 2 + offsets[1]
                    });
                else if (direction === 'right')
                    hint.css({
                        top: offset.top + (item.outerHeight() - 18) / 2 + offsets[0],
                        left: offset.left + item.outerWidth() + offsets[1]
                    });
                else if (direction === 'left')
                    hint.css({
                        top: offset.top + (item.outerHeight() - 18) / 2 + offsets[0],
                        left: offset.left - 18 + offsets[1]
                    });
                else
                    hint.css({
                        top: offset.top + item.outerHeight() + offsets[0],
                        left: offset.left + (item.outerWidth() - 18) / 2 + offsets[1]
                    });
                $(document.body).append(hint);

                _currentHints.push(hint);
            }
        });
    };

    var _removeHints = function() {
        _currentHints && _currentHints.forEach(function(item) {
            item.remove()
        });
    };

    var _resetToDefault = function() {
        _currentLevel = $('#file-menu-panel').is(':visible') ? 1 : 0;
        _setCurrentSection();
        _currentHints.length = 0;
        _currentControls.length = 0;
    };

    var _init = function() {
        Common.NotificationCenter.on({
            'app:ready': function (mode) {
                _lang = mode.lang;
                _getAlphabetLetters();
            },
            'hints:clear': _clearHints
        });
        $(document).on('keyup', function(e) {
            if (e.keyCode == Common.UI.Keys.ALT && _isAlt) {
                e.preventDefault();
                if (!_hintVisible) {
                    $('input').blur(); // to change value in inputField
                    _currentLevel = $('#file-menu-panel').is(':visible') ? 1 : 0;
                    _setCurrentSection();
                    _showHints();
                } else {
                    _hideHints();
                    _resetToDefault();
                }
            }
            _isAlt = false;
        });
        $(document).on('keydown', function(e) {
            if (_hintVisible) {
                if (e.keyCode == Common.UI.Keys.ESC ) {
                    if (_currentLevel === 0) {
                        _hideHints();
                    } else {
                        _prevLevel();
                        _setCurrentSection('esc');
                        _showHints();
                    }
                } else {
                    var curr;
                    var curLetter = _lang === 'en' ? String.fromCharCode(e.keyCode) : e.key;
                    if (_lang !== 'en' && _arrAlphabet.indexOf(curLetter.toLowerCase()) === -1) {
                        var ind = _arrEnQwerty.indexOf(curLetter.toLowerCase());
                        if (ind !== -1) {
                            curLetter = _arrQwerty[ind];
                        }
                    }
                    _inputLetters = _inputLetters + curLetter.toUpperCase();
                    for (var i = 0; i < _currentControls.length; i++) {
                        var item = _currentControls[i];
                        if (!_isItemDisabled(item) && item.attr('data-hint-title') === _inputLetters) {
                            curr = item;
                            break;
                        }
                    }
                    if (curr) {
                        var tag = curr.prop("tagName").toLowerCase();
                        if (window.SSE && curr.parent().prop('id') === 'statusbar_bottom') {
                            curr.contextmenu();
                            _clearHints();
                        } else if (tag === 'input' || tag === 'textarea') {
                            curr.trigger(jQuery.Event('click', {which: 1}));
                            curr.focus();
                            _clearHints();
                        } else {
                            if (!curr.attr('content-target') || (curr.attr('content-target') && !$(`#${curr.attr('content-target')}`).is(':visible'))) { // need to open panel
                                if (!($('#file-menu-panel').is(':visible') && (curr.parent().prop('id') === 'fm-btn-info' && $('#panel-info').is(':visible') ||
                                    curr.parent().prop('id') === 'fm-btn-settings' && $('#panel-settings').is(':visible')))) {
                                    if (curr.attr('for')) { // to trigger event in checkbox
                                        $(`#${curr.attr('for')}`).trigger(jQuery.Event('click', {which: 1}));
                                    } else {
                                        curr.trigger(jQuery.Event('click', {which: 1}));
                                    }
                                }
                            }
                            if (curr.prop('id') === 'btn-goback' || curr.closest('.btn-slot').prop('id') === 'slot-btn-options' || curr.prop('id') === 'left-btn-thumbs') {
                                _clearHints();
                            }
                            if (curr.prop('id') === 'add-comment-doc') {
                                _removeHints();
                                _currentHints.length = 0;
                                _currentControls.length = 0;
                                _showHints();
                                return;
                            }
                            if (!_isClear) {
                                _nextLevel();
                                _setCurrentSection(curr);
                                _showHints();
                            }
                        }
                        _isClear = false;
                    }
                }
                e.preventDefault();
            }

            _isAlt = (e.keyCode == Common.UI.Keys.ALT);
        });
    };

    var _getAlphabetLetters = function () {
        Common.Utils.loadConfig('../../common/main/resources/alphabetletters/alphabetletters.json', function (langsJson) {
            _arrAlphabet = langsJson[_lang];
            _arrEnAlphabet = langsJson['en'];
        });
        Common.Utils.loadConfig('../../common/main/resources/alphabetletters/qwertyletters.json', function (langsJson) {
            _arrQwerty = langsJson[_lang];
            if (_lang !== 'en') {
                _arrEnQwerty = langsJson['en'];
            }
        });
    };

    var _needCloseFileMenu = function () {
        return !(_hintVisible && _currentLevel > 1);
    };

    var _clearHints = function () {
        if (_hintVisible) {
            _hideHints();
            _resetToDefault();
            _isClear = true;
        }
    };

    var _isHintVisible = function () {
        return _hintVisible;
    };

    return {
        init: _init,
        clearHints: _clearHints,
        needCloseFileMenu: _needCloseFileMenu,
        isHintVisible: _isHintVisible
    }
})();