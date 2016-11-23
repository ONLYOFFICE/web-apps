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
    'text!presentationeditor/mobile/app/template/EditParagraph.template',
    'jquery',
    'underscore',
    'backbone'
], function (editTemplate, $, _, Backbone) {
    'use strict';

    PE.Views.EditParagraph = Backbone.View.extend(_.extend((function() {
        // private

        var _bullets = [
            [
                {type: -1, thumb: ''},
                {type: 1, thumb: 'bullet-01.png'},
                {type: 2, thumb: 'bullet-02.png'},
                {type: 3, thumb: 'bullet-03.png'}
            ],
            [
                {type: 4, thumb: 'bullet-04.png'},
                {type: 5, thumb: 'bullet-05.png'},
                {type: 6, thumb: 'bullet-06.png'},
                {type: 7, thumb: 'bullet-07.png'}
            ]
        ];

        var _numbers = [
            [
                {type: -1, thumb: ''},
                {type: 4, thumb: 'number-01.png'},
                {type: 5, thumb: 'number-02.png'},
                {type: 6, thumb: 'number-03.png'}
            ],
            [
                {type: 1, thumb: 'number-04.png'},
                {type: 2, thumb: 'number-05.png'},
                {type: 3, thumb: 'number-06.png'},
                {type: 7, thumb: 'number-07.png'}
            ]
        ];

        return {
            // el: '.view-main',

            template: _.template(editTemplate),

            events: {
            },

            initialize: function () {
                Common.NotificationCenter.on('editcontainer:show', _.bind(this.initEvents, this));
            },

            initEvents: function () {
                var me = this;

                $('#font-line-spacing').single('click', _.bind(me.showLineSpacing, me));
                $('#font-bullets').single('click',      _.bind(me.showBullets, me));
                $('#font-numbers').single('click',      _.bind(me.showNumbers, me));

                PE.getController('EditParagraph').initSettings();
            },

            // Render layout
            render: function () {
                this.layout = $('<div/>').append(this.template({
                    android : Common.SharedSettings.get('android'),
                    phone   : Common.SharedSettings.get('phone'),
                    scope   : this,
                    bullets : _bullets,
                    numbers : _numbers
                }));

                return this;
            },

            rootLayout: function () {
                if (this.layout) {
                    return this.layout
                        .find('#edit-paragraph-root')
                        .html();
                }

                return '';
            },

            showPage: function (templateId, suspendEvent) {
                var rootView = PE.getController('EditContainer').rootView;

                if (rootView && this.layout) {
                    var $content = this.layout.find(templateId);

                    // Android fix for navigation
                    if (Framework7.prototype.device.android) {
                        $content.find('.page').append($content.find('.navbar'));
                    }

                    rootView.router.load({
                        content: $content.html()
                    });

                    if (suspendEvent !== true) {
                        this.fireEvent('page:show', [this, templateId]);
                    }
                }
            },

            showLineSpacing: function () {
                this.showPage('#edit-text-linespacing');
            },

            showBullets: function () {
                this.showPage('#edit-text-bullets');
            },

            showNumbers: function () {
                this.showPage('#edit-text-numbers');
            },

            textBack: 'Back',
            textFromText: 'Distance from Text',
            textBefore: 'Before',
            textAfter: 'After',
            textLineSpacing: 'Line Spacing',
            textBullets: 'Bullets',
            textNone: 'None',
            textNumbers: 'Numbers'
        }
    })(), PE.Views.EditParagraph || {}))
});