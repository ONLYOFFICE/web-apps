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
 *  de-mobile-edit-tablet-ios.js
 *
 *  Created by Alexander Yuzhin on 1/10/17
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

var Utils = require('../utils');

module.exports = {
    before : function (browser) {
        Utils.init(browser);
        browser.resizeWindow(800, 600);
    },

    'Launch Document Editor' : function (browser) {
        Utils.openEditor('http://local:3000/editor?type=mobile&mode=edit&fileName=sample.docx');
    },

    'Text settings' : function (browser) {
        Utils.canvasClick(280, 280)
            .click('#toolbar-edit')
            .pause(500);

        Utils.isPresent('div.edit-root-view');
        Utils.isPresent('#edit-text');
        Utils.isPresent('#edit-paragraph');

        // Text tap
        Utils.hasClass('#edit-text', 'active');

        browser.expect.element('#font-fonts .item-title').text.to.equal('Arial');
        browser.expect.element('#font-fonts .item-after span:first-child').text.to.equal('11 pt');

        Utils.hasClass('#font-bold', 'active');
        Utils.hasNoClass('#font-italic', 'active');
        Utils.hasNoClass('#font-underline', 'active');
        Utils.hasNoClass('#font-strikethrough', 'active');

        Utils.hasClass('#font-left', 'active');
        Utils.hasNoClass('#font-center', 'active');
        Utils.hasNoClass('#font-right', 'active');
        Utils.hasNoClass('#font-just', 'active');

        // Fonts view
        browser
            .click('#font-fonts')
            .waitForElementVisible('.page[data-page=edit-text-font-page]', 1000)
            .pause(500);

        browser.expect.element('#font-size .item-after label').text.to.equal('11 pt');
        browser.elements('css selector', '#font-list li', function(result) {
            browser.assert.ok(result.value.length > 1, 'Font name list is not empty');
        });

        browser
            .click('.navbar-on-center a.back')
            .pause(500);

        // Paragraph tap
        browser
            .click('.categories a[href*=edit-paragraph]')
            .pause(500);

        Utils.hasClass('#edit-paragraph', 'active');

        browser.elements('css selector', '#paragraph-list li', function(result) {
            browser.assert.ok(result.value.length > 1, 'Paragraph style list is not empty');
        });
    },

    'Exit from Document Editor' : function (browser) {
        var delay = 3000;

        Utils.isPresent('.view-main');
        console.log('Finish testing after delay', delay, 'ms.');

        browser
            .pause(delay)
            .frame(null) // Exit from iframe
            .end(); // Close browser
    }
};