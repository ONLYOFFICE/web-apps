/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment } from 'react';
import { observer, inject } from "mobx-react";
import { Page, Navbar, Link } from "framework7-react";
import { useTranslation } from "react-i18next";
import { Device } from '../../utils/device';

const PageAbout = props => {
    const { t } = useTranslation();
    const _t = t("About", { returnObjects: true });
    const store = props.storeAppOptions;
    const isCanBranding = store.canBranding;
    const licInfo = isCanBranding ? store.customization : null;
    const customer = licInfo ? licInfo.customer : null;
    const {
        name: nameCustomer = null,
        mail: mailCustomer = null,
        phone: phoneCustomer = null,
        address: addressCustomer = null,
        www: urlCustomer = null,
        info: infoCustomer = null,
        logo: logoCustomer = null
    } = customer || {};

    const publisherUrl = __PUBLISHER_URL__, 
        publisherPrintUrl = publisherUrl.replace(/https?:\/{2}|\/$/g,"");
    const publisherName = __PUBLISHER_NAME__.replace(/\\"/g, '"');
    
    const editors = {
        de: 'DOCUMENT EDITOR',
        pe: 'PRESENTATION EDITOR',
        sse: 'SPREADSHEET EDITOR',
        ve: 'VISIO EDITOR'
    };

    const nameEditor = (_t.textEditor || editors[editorType]).toUpperCase();

    return (
        <Page className={"about" + (!Device.phone ? " about_tablet" : Device.ios ? " about_ios" : " about_android")}>
            <Navbar title={_t.textAbout} backLink={_t.textBack} />
            {licInfo && typeof licInfo == 'object' && typeof(customer) == 'object' ? (
                <Fragment>
                    <div className="logo-block">
                        {logoCustomer && logoCustomer.length ? (
                            <div id="settings-about-logo" className="logo-block__elem">
                                <img src={logoCustomer} alt="" />
                            </div>
                        ) : null}
                    </div>
                    <div className="about__editor">
                        <p className="about__text">{nameEditor}</p>
                        <p className="about__text">{_t.textVersion} {__PRODUCT_VERSION__}</p>
                    </div>
                    {mailCustomer || phoneCustomer ? (
                        <div className="about__customer">
                            {mailCustomer && mailCustomer.length ? (
                                <p className="about__text">
                                    <Link id="settings-about-email" external={true} href={"mailto:"+mailCustomer}>{mailCustomer}</Link>
                                </p>
                            ) : null}
                            {phoneCustomer && phoneCustomer.length ? (
                                <p className="about__text">
                                    <Link id="settings-about-tel" external={true} href={"tel:"+phoneCustomer}>{phoneCustomer}</Link>
                                </p>
                            ) : null}
                        </div>
                    ) : null}
                    {addressCustomer && addressCustomer.length ? (
                        <div className="about__customer">
                            <p className="about__text">
                                <Link id="settings-about-address" external={true}>{addressCustomer}</Link>
                            </p>
                        </div>
                    ) : null}
                    {(nameCustomer?.length || infoCustomer?.length || urlCustomer?.length) && (
                        <div className="about__customer">
                            {nameCustomer?.length && (
                                <p id="settings-about-name" className="about__text">{nameCustomer}</p>
                            )}
                            {infoCustomer?.length && (
                                <p className="about__text">{infoCustomer}</p>
                            )}
                            {urlCustomer?.length && (
                                <p className="about__text">
                                    <Link id="settings-about-url" external={true} target="_blank" 
                                        href={!/^https?:\/{2}/i.test(urlCustomer) ? "http:\/\/" : '' + urlCustomer}>
                                        {urlCustomer}
                                    </Link>
                                </p>
                            )}
                        </div>
                    )}
                    <div className="about__contacts">
                        <p className="about__text" id="settings-about-address">
                            {__PUBLISHER_ADDRESS__}
                        </p>
                    </div>
                    <div className="about__licensor" id="settings-about-licensor">
                        <p className="about__text">{publisherName}</p>
                        <p className="about__text">
                            <Link external={true} target="_blank" href={publisherUrl}>{publisherPrintUrl}</Link>
                        </p>
                    </div>
                </Fragment>
            ) : (
                <Fragment>
                    <div className="about__logo"></div>
                    <div className="about__editor">
                        <p className="about__text">{nameEditor}</p>
                        <p className="about__text">{_t.textVersion} {__PRODUCT_VERSION__}</p>
                    </div>
                    <div className="about__contacts">
                        <p className="about__text" id="settings-about-address">
                            {__PUBLISHER_ADDRESS__}
                        </p>
                    </div>
                    <div className="about__licensor">
                        <p className="about__text" id="settings-about-name">{publisherName}</p>
                        <p className="about__text">
                            <Link id="settings-about-url" external={true} target="_blank" href={publisherUrl}>{publisherPrintUrl}</Link>
                        </p>
                    </div>
                </Fragment>
            )}
        </Page>
    );
};

const About = inject("storeAppOptions")(observer(PageAbout));
About.appVersion = () => (__PRODUCT_VERSION__).match(/\d+.\d+.\d+/)[0];     // skip build number
About.compareVersions = () => /d$/.test(__PRODUCT_VERSION__);
About.developVersion = () => /(?:d|debug)$/.test(__PRODUCT_VERSION__);


export default About;
