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
 *  Settings.js
 *
 *  Created by Maxim Kadushkin on 12/05/2016
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!spreadsheeteditor/mobile/app/template/Settings.template',
    'jquery',
    'underscore',
    'backbone'
], function (settingsTemplate, $, _, Backbone) {
    'use strict';

    SSE.Views.Settings = Backbone.View.extend(_.extend((function() {
        // private
        var isEdit,
            canEdit = false,
            canDownload = false,
            canAbout = true;

        return {
            // el: '.view-main',

            template: _.template(settingsTemplate),

            events: {
                //
            },

            initialize: function() {
                Common.NotificationCenter.on('settingscontainer:show', _.bind(this.initEvents, this));

                Common.Gateway.on('opendocument', _.bind(this.loadDocument, this));
            },

            initEvents: function () {
                var me = this;

                $('#settings-document-info').single('click',    _.bind(me.showDocumentInfo, me));
                $('#settings-download').single('click',         _.bind(me.showDownload, me));
                $('#settings-history').single('click',          _.bind(me.showHistory, me));
                $('#settings-help').single('click',             _.bind(me.showHelp, me));
                $('#settings-about').single('click',            _.bind(me.showAbout, me));

                me.initControls();
            },

            // Render layout
            render: function() {
                this.layout = $('<div/>').append(this.template({
                    android : Common.SharedSettings.get('android'),
                    phone   : Common.SharedSettings.get('phone'),
                    scope   : this
                    , saveas: {
                        xlsx: Asc.c_oAscFileType.XLSX,
                        pdf: Asc.c_oAscFileType.PDF,
                        ods: Asc.c_oAscFileType.ODS,
                        csv: Asc.c_oAscFileType.CSV
                    }
                }));

                return this;
            },

            setMode: function (mode) {
                isEdit = mode.isEdit;
                canEdit = !mode.isEdit && mode.canEdit && mode.canRequestEditRights;
                canDownload = mode.canDownload || mode.canDownloadOrigin;

                if (mode.customization && mode.canBrandingExt) {
                    canAbout = (mode.customization.about!==false);
                }
            },

            rootLayout: function () {
                if (this.layout) {
                    var $layout = this.layout.find('#settings-root-view'),
                        isPhone = Common.SharedSettings.get('phone');

                    if (isEdit) {
                        $layout.find('#settings-search .item-title').text(this.textFindAndReplace)
                    } else {
                    }
                    if (!canDownload) $layout.find('#settings-download').hide();
                    if (!canAbout) $layout.find('#settings-about').hide();

                    return $layout.html();
                }

                return '';
            },

            initControls: function() {
                //
            },

            showPage: function(templateId) {
                var rootView = SSE.getController('Settings').rootView();

                if (rootView && this.layout) {
                    var $content = this.layout.find(templateId);

                    // Android fix for navigation
                    if (Framework7.prototype.device.android) {
                        $content.find('.page').append($content.find('.navbar'));
                    }

                    rootView.router.load({
                        content: $content.html()
                    });

                    this.fireEvent('page:show', [this, templateId]);
                }
            },

            showDocumentInfo: function() {
                this.showPage('#settings-info-view');

                var document = Common.SharedSettings.get('document') || {},
                        info = document.info || {};

                $('#settings-document-title').html(document.title ? document.title : this.unknownText);
                $('#settings-document-autor').html(info.author ? info.author : this.unknownText);
                $('#settings-document-date').html(info.created ? info.created : this.unknownText);
            },

            showDownload: function () {
                this.showPage('#settings-download-view');
            },

            showHistory: function () {
                this.showPage('#settings-history-view');
            },

            showHelp: function () {
                this.fireEvent('settings:showhelp');
            },

            showAbout: function () {
                this.showPage('#settings-about-view');
            },

            loadDocument: function(data) {
                var permissions = {};

                if (data.doc) {
                    permissions = _.extend(permissions, data.doc.permissions);

                    if (permissions.edit === false) {
                    }
                }
            },

            unknownText: 'Unknown',
            textFindAndReplace: 'Find and Replace',
            textSettings: 'Settings',
            textDone: 'Done',
            textFind: 'Find',
            textEditDoc: 'Edit Document',
            textDownload: 'Download',
            textDocInfo: 'Document Info',
            textHelp: 'Help',
            textAbout: 'About',
            textBack: 'Back',
            textDocTitle: 'Document title',
            textLoading: 'Loading...',
            textAuthor: 'Author',
            textCreateDate: 'Create date',
            textDownloadAs: 'Download As...',
            textVersion: 'Version',
            textAddress: 'address',
            textEmail: 'email',
            textTel: 'tel',
            textPoweredBy: 'Powered by'
    }
    })(), SSE.Views.Settings || {}))
});