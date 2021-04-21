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
    var _isAlt = false,
        _hintVisible = false,
        _currentLevel = -1,
        _controls = [],
        _currentControls = [],
        _currentHints = [];

    var _showHints = function() {
        _hintVisible = !_hintVisible;
        if (_hintVisible) {
            _currentLevel++;
            _getHints();
        } else {
            _removeHints();
            _currentLevel--;
        }
    };

    var _getControls = function() {
        if (!_controls[_currentLevel + 1]) {
            _controls[_currentLevel + 1] = $('[data-hint=' + (_currentLevel + 1) + ']').toArray();
            if (_currentLevel==0 && !_controls[_currentLevel])
                _controls[_currentLevel] = $('[data-hint=0]').toArray();
        }

        _currentControls = [];
        var arr = [];
        if (_currentLevel==0) {
            arr = arr.concat(_controls[_currentLevel]);
           !$('.toolbar-fullview-panel').is(':visible') && (arr = arr.concat(_controls[_currentLevel+1]));
        } else
            arr = _controls[_currentLevel+1];
        arr.forEach(function(item, index) {
            var el = $(item);
            if (el.is(':visible')) {
                el.attr('data-hint-title', String.fromCharCode(65 + index));
                _currentControls.push(el);
            }
        });
        return _currentControls;
    };

    var _getHints = function() {
        _removeHints();
        _getControls();
        _currentControls.forEach(function(item, index) {
            var offset = item.offset();
            var hint = $('<div style="" class="hint-div">' + item.attr('data-hint-title') + '</div>');
            var direction = item.attr('data-hint-direction');
            if (direction=='right')
                hint.css({left: offset.left + item.outerWidth(), top: offset.top + (item.outerHeight()-20)/2});
            else
                hint.css({left: offset.left + (item.outerWidth() - 20)/2, top: offset.top + item.outerHeight()});
            $(document.body).append(hint);

            _currentHints.push(hint);
        });
    };

    var _removeHints = function() {
        _currentHints && _currentHints.forEach(function(item) {
            item.remove()
        });
    };

    var _init = function() {
        $(document).on('keyup', function(e) {
            if (e.keyCode == Common.UI.Keys.ALT &&_isAlt) {
                e.preventDefault();
                _showHints();
            }
            _isAlt = false;
        });
        $(document).on('keydown', function(e) {
            if (_hintVisible) {
                if (e.keyCode == Common.UI.Keys.ESC ) {
                    _showHints();
                } else if ((e.keyCode > 47 && e.keyCode < 58 || e.keyCode > 64 && e.keyCode < 91) && e.key) {
                    var curr;
                    for (var i = 0; i < _currentControls.length; i++) {
                        var item = _currentControls[i];
                        if (item.attr('data-hint-title').charCodeAt(0) == e.keyCode) { // for latin chars
                            curr = item;
                            break;
                        }
                    }
                    if (curr) {
                        _showHints();
                        curr && curr.trigger(jQuery.Event('click', {which: 1}));
                    }
                }
                e.preventDefault();
            }

            _isAlt = (e.keyCode == Common.UI.Keys.ALT);
        });
    };

    return {
        init: _init
    }
})();