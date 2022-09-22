import React, { Fragment } from 'react';
import { observer, inject } from "mobx-react";
import { Page, Navbar, Link } from "framework7-react";
import { useTranslation } from "react-i18next";

const PageAbout = props => {
    const { t } = useTranslation();
    const _t = t("About", { returnObjects: true });
    const store = props.storeAppOptions;
    const isCanBranding = store.canBranding;
    const licInfo = isCanBranding ? store.customization : null;
    const customer = licInfo ? licInfo.customer : null;
    const nameCustomer = customer ? customer.name : null;
    const mailCustomer = customer ? customer.mail : null;
    const phoneCustomer = customer ? customer.phone : null;
    const addressCustomer = customer ? customer.address : null;
    const urlCustomer = customer ? customer.www : null;
    const infoCustomer = customer ? customer.info : null;
    const logoCustomer = customer ? customer.logo : null;

    const publisherUrl = __PUBLISHER_URL__,
        publisherPrintUrl = publisherUrl.replace(/https?:\/{2}|\/$/g,"");
    const publisherName = __PUBLISHER_NAME__.replace(/\\"/g, '"');
    
    const editors = {
        de: 'DOCUMENT EDITOR',
        pe: 'PRESENTATION EDITOR',
        sse: 'SPREADSHEET EDITOR'
    };

    const nameEditor = (_t.textEditor || editors[editorType]).toUpperCase();

    return (
        <Page className="about">
            <Navbar title={_t.textAbout} backLink={_t.textBack} />
            {licInfo && typeof licInfo == 'object' && typeof(customer) == 'object' ? (
                <Fragment>
                    <div className="content-block">
                        {logoCustomer && logoCustomer.length ? (
                            <div id="settings-about-logo" className="settings-about-logo">
                                <img src={logoCustomer} alt="" />
                            </div>
                        ) : null}
                    </div>
                    <div className="content-block">
                        <h3>{nameEditor}</h3>
                        <h3>{_t.textVersion} {__PRODUCT_VERSION__}</h3>
                    </div>
                    <div className="content-block">
                        {nameCustomer && nameCustomer.length ? (
                            <h3 id="settings-about-name" className="vendor">{nameCustomer}</h3>
                        ) : null}
                        {addressCustomer && addressCustomer.length ? (
                            <p>
                                <label>{_t.textAddress}:</label>
                                <Link id="settings-about-address" className="external">{addressCustomer}</Link>
                            </p>
                        ) : null}
                        {mailCustomer && mailCustomer.length ? (
                            <p>
                                <label>{_t.textEmail}:</label>
                                <Link id="settings-about-email" external={true} href={"mailto:"+mailCustomer}>{mailCustomer}</Link>
                            </p>
                        ) : null}
                        {phoneCustomer && phoneCustomer.length ? (
                            <p>
                                <label>{_t.textTel}:</label>
                                <Link id="settings-about-tel" external={true} href={"tel:"+phoneCustomer}>{phoneCustomer}</Link>
                            </p>
                        ) : null}

                        {urlCustomer && urlCustomer.length ? (
                            <p>
                                <Link id="settings-about-url" className="external" target="_blank" 
                                    href={!/^https?:\/{2}/i.test(urlCustomer) ? "http:\/\/" : '' + urlCustomer}>
                                    {urlCustomer}
                                </Link>
                            </p>
                        ) : null} 
                        {infoCustomer && infoCustomer.length ? (
                            <p>
                                <label id="settings-about-info">{infoCustomer}</label>
                            </p>
                        ) : null}
                    </div>
                    <div className="content-block" id="settings-about-licensor">
                        <div className="content-block-inner"></div>
                        <p>
                            <label>{_t.textPoweredBy}</label>
                        </p>
                        <h3 className="vendor">{publisherName}</h3>
                        <p>
                            <Link className="external" target="_blank" href={publisherUrl}>{publisherPrintUrl}</Link>
                        </p>
                    </div>
                </Fragment>
            ) : (
                <Fragment>
                    <div className="content-block">
                        <div className="logo"></div>
                    </div>
                    <div className="content-block">
                        <h3>{nameEditor}</h3>
                        <h3>{_t.textVersion} {__PRODUCT_VERSION__}</h3>
                    </div>
                    <div className="content-block">
                        <h3 id="settings-about-name" className="vendor">{publisherName}</h3>
                        <p>
                            <label>{_t.textAddress}:</label>
                            <a id="settings-about-address" className="external">{__PUBLISHER_ADDRESS__}</a>
                        </p>
                        <p>
                            <label>{_t.textEmail}:</label>
                            <Link id="settings-about-email" external={true} href={`mailto:${__SUPPORT_EMAIL__}`}>{__SUPPORT_EMAIL__}</Link>
                        </p>
                        <p>
                            <label>{_t.textTel}:</label>
                            <Link id="settings-about-tel" external={true} href={`tel:${__PUBLISHER_PHONE__}`}>{__PUBLISHER_PHONE__}</Link>
                        </p>
                        <p>
                            <a id="settings-about-url" className="external" target="_blank" href={publisherUrl}>{publisherPrintUrl}</a>
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