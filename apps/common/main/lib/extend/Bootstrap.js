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
 *  Bootstrap.js
 *
 *  Created by Alexander Yuzhin on 5/27/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

function onDropDownKeyDown(e) {
    var $this       = $(this),
        $parent     = $this.parent(),
        beforeEvent = jQuery.Event('keydown.before.bs.dropdown'),
        afterEvent  = jQuery.Event('keydown.after.bs.dropdown');

    $parent.trigger(beforeEvent);

    if ($parent.hasClass('no-stop-propagate')) {
        if (arguments.length>1 && arguments[1] instanceof KeyboardEvent)
            e = arguments[1];
        if ( /^(38|40|27|13|9|37|39)$/.test(e.keyCode) && !e.ctrlKey && !e.altKey) {
            patchDropDownKeyDownAdditional.call(this, e);
            if (!/(37|39)/.test(e.keyCode)) {
                e.preventDefault();
                e.stopPropagation();
            }
        }
    } else {
        patchDropDownKeyDown.call(this, e);
        e.preventDefault();
        e.stopPropagation();
    }

    $parent.trigger(afterEvent);
}

function patchDropDownKeyDown(e) {
    if (!/(38|40|27|37|39)/.test(e.keyCode)) return;

    var $this = $(this);

    e.preventDefault();
    e.stopPropagation();

    if ($this.is('.disabled, :disabled')) return;

    var $parent  = getParent($this);
    var isActive = $parent.hasClass('open') || $parent.hasClass('over');

    if (!isActive || (isActive && e.keyCode == 27)) {
        if (e.which == 27) {
            $items = $('[role=menu] li.dropdown-submenu.over:visible', $parent);
            if ($items.length) {
                $items.eq($items.length-1).removeClass('over');
                return false;
            } else if ($parent.hasClass('dropdown-submenu') && $parent.hasClass('over')) {
                $parent.removeClass('over');
                $parent.find('> a').focus();
            } else {
                $parent.find('[data-toggle=dropdown]').focus();
            }
        }
        return (isActive) ? $this.click() : undefined;
    }

//    var $items = $('[role=menu] li:not(.divider):visible a', $parent)   - original search function
    var $items = $('> [role=menu] > li:not(.divider):not(.disabled):visible', $parent).find('> a');

    if (!$items.length) return;

    var index = $items.index($items.filter(':focus'));
    if (e.keyCode == 39) {     // right
        if (index<0) return;

        var li = $items.eq(index).parent();
        if (li.hasClass('dropdown-submenu') && !li.hasClass('over')) {// open submenu and select first <li> item
            li.mouseenter();
            li.addClass('focused-submenu');
             _.delay(function() {
                 var mnu = $('> [role=menu]', li),
                    $subitems = mnu.find('> li:not(.divider):not(.disabled):visible > a'),
                    $dataviews = mnu.find('> li:not(.divider):not(.disabled):visible .dataview'),
                    focusIdx = 0;
                 if (mnu.find('> .menu-scroll').length>0) {
                    var offset = mnu.scrollTop();
                    for (var i=0; i<$subitems.length; i++) {
                        if ($subitems[i].offsetTop > offset) {
                            focusIdx = i; break;
                        }
                    }
                }
                if ($subitems.length>0 && $dataviews.length<1)
                    $subitems.eq(focusIdx).focus();
            }, 250);
        }
    } else if (e.keyCode == 37) {     // left
        if ($parent.hasClass('dropdown-submenu') && $parent.hasClass('over')) { // close submenu
            $parent.removeClass('over');
            $parent.find('> a').focus();
        }
    } else {
        if (e.keyCode == 38) { index > 0 ? index-- : ($this.hasClass('no-cyclic') ? (index = 0) : (index = $items.length - 1));} else         // up
        if (e.keyCode == 40) { index < $items.length - 1 ? index++ : ($this.hasClass('no-cyclic') ? (index = $items.length - 1) : (index = 0));}              // down
        if (!~index) index=0;
        if ($parent.hasClass('dropdown-submenu') && $parent.hasClass('over'))
            $parent.addClass('focused-submenu'); // for Safari. When focus go from parent menuItem to it's submenu don't hide this submenu

        $items.eq(index).focus();
    }
}

function patchDropDownKeyDownAdditional(e) { // only for formula menu when typing in cell editor
    if (!/(38|40|27|37|39)/.test(e.keyCode)) return;

    var $this = $(this);

    if (!/(37|39)/.test(e.keyCode)) {
        e.preventDefault();
        e.stopPropagation();
    }

    if ($this.is('.disabled, :disabled')) return;

    var $parent  = getParent($this);
    var isActive = $parent.hasClass('open') || $parent.hasClass('over');

    if (!isActive || (isActive && (e.keyCode == 27 || e.keyCode == 37 || e.keyCode == 39))) {
//        if (e.which == 27)
//            $parent.find('[data-toggle=dropdown]').focus();
        return (isActive) ? $this.click() : undefined;
    }

    var $items = $('> [role=menu] > li:not(.divider):not(.disabled):visible', $parent).find('> a');

    if (!$items.length) return;

    var index = $items.index($items.filter('.focus'));
    if (e.keyCode == 38) { index > 0 ? index-- : ($this.hasClass('no-cyclic') ? (index = 0) : (index = $items.length - 1));} else         // up
    if (e.keyCode == 40) { index < $items.length - 1 ? index++ : ($this.hasClass('no-cyclic') ? (index = $items.length - 1) : (index = 0));}              // down
    if (!~index) index=0;

    $items.removeClass('focus');
    $items.eq(index).addClass('focus');
}

function getParent($this) {
    var selector = $this.attr('data-target');

    if (!selector) {
        selector = $this.attr('href');
        selector = selector && /#/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
    }

    var $parent = selector && $(selector);

    return $parent && $parent.length ? $parent : $this.parent();
}

function clearMenus(isFromInputControl) {
    $('.dropdown-toggle').each(function (e) {
        var $parent = ($(this)).parent();
        if (!$parent.hasClass('open')) return;
        if ($parent.attr('data-value') == 'prevent-canvas-click') {
            $parent.attr('data-value','');
            return;
        }
        $parent.trigger(e = $.Event('hide.bs.dropdown'));
        if (e.isDefaultPrevented()) return;
        $parent.removeClass('open').trigger('hidden.bs.dropdown', isFromInputControl);
    })
}

$(document)
    .off('keydown.bs.dropdown.data-api')
    .on('keydown.bs.dropdown.data-api', '[data-toggle=dropdown], [role=menu]' , onDropDownKeyDown);

/*
*      workaround closing menu by right click
* */
(function () {
    var eventsObj = $._data($(document).get(0), "events"), clickDefHandler;
    if (eventsObj && eventsObj.click) {
        eventsObj.click.every(function(e, i, a){
            if (/click/.test(e.type) && !e.selector && /bs\..+\.dropdown/.test(e.namespace)) {
                clickDefHandler = e.handler;
            }

            return !clickDefHandler;
        });
    }

    function onDropDownClick(e) {
        if (e.which == 1 || e.which == undefined)
            clearMenus(/form-control/.test(e.target.className));
    }

    if (!!clickDefHandler) {
        $(document)
            .off('click.bs.dropdown.data-api', clickDefHandler)
            .on('click.bs.dropdown.data-api', onDropDownClick);
    }
})();
/*
* */