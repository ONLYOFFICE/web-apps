/**
 *  ToggleManager.js
 *
 *  Created by Alexander Yuzhin on 1/28/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */


if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/BaseView'
], function () {
    'use strict';

    var groups = {};

    function toggleGroup(cmp, state) {
        var g, i, l;
        if (state) {
            g = groups[cmp.toggleGroup];
            for (i = 0, l = g.length; i < l; i++) {
                if (g[i] !== cmp) {
                    if (g[i].isActive) {
                        g[i].isActive() && g[i].toggle(false);
                    } else {
                        g[i].toggle(false);
                    }
                }
            }
        }
    }

    /**
     * Private utility class used by component
     */
    Common.UI.ToggleManager = {
        register: function(cmp) {
            if (!cmp.toggleGroup) {
                return;
            }
            var group = groups[cmp.toggleGroup];
            if (!group) {
                group = groups[cmp.toggleGroup] = [];
            }
            group.push(cmp);
            cmp.on('toggle', toggleGroup);
        },

        unregister: function(cmp) {
            if (!cmp.toggleGroup) {
                return;
            }
            var group = groups[cmp.toggleGroup];
            if (group) {
                _.without(group, cmp);
                cmp.off('toggle', toggleGroup);
            }
        },

        /**
         * Gets the toggled components in the passed group or null
         * @param {String} group
         * @return {Common.UI.BaseView}
         */
        getToggled: function(group) {
            var g = groups[group],
                i = 0,
                len;
            if (g) {
                for (len = g.length; i < len; i++) {
                    if (g[i].pressed === true ||
                        g[i].checked === true) {
                        return g[i];
                    }
                }
            }
            return null;
        }
    }
});