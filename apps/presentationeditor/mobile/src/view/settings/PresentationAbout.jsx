import React, { Fragment } from 'react';
import { observer, inject } from "mobx-react";
import { Page, Navbar, Link } from "framework7-react";
import { useTranslation } from "react-i18next";

const PagePresentationAbout = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const store = props.storeAppOptions;
    const isCanBranding = store.canBranding;
    const licInfo = isCanBranding ? store.customization : null;
    const customer = licInfo ? licInfo.customer : null;
    const nameCustomer = customer ? customer.name : null;
    const mailCustomer = customer ? customer.mail : null;
    const addressCustomer = customer ? customer.address : null;
    const urlCustomer = customer ? customer.www : null;
    const infoCustomer = customer ? customer.info : null;
    const logoCustomer = customer ? customer.logo : null;

    const publisherUrl = __PUBLISHER_URL__,
        publisherPrintUrl = publisherUrl.replace(/https?:\/{2}|\/$/,"");
    return (
        <Page className="about">
            <Navbar title={_t.textAbout} backLink={_t.textBack} />
            <div className="content-block">
                {licInfo && typeof licInfo == 'object' && typeof(customer)=='object' ? null : (
                    <i className="logo"></i>
                )}
                {logoCustomer && logoCustomer.length ? (
                    <div id="settings-about-logo" className="settings-about-logo">
                        <img src={logoCustomer} />
                    </div>
                ) : null}
            </div>
            <div className="content-block">
                <h3>PRESENTATION EDITOR</h3>
                <h3>{_t.textVersion} {__PRODUCT_VERSION__}</h3>
            </div>
            <div className="content-block">
                <p>
                    <label>{_t.textAddress}</label>
                    <a id="settings-about-address" className="external">{__PUBLISHER_ADDRESS__}</a>
                </p>
                <p>
                    <label>{_t.textEmail}</label>
                    <a id="settings-about-email" className="external" href={`mailto:${__SUPPORT_EMAIL__}`}>{__SUPPORT_EMAIL__}</a>
                </p>
                <p>
                    <label>{_t.textTel}</label>
                    <a id="settings-about-tel" className="external" href={`tel:${__PUBLISHER_PHONE__}`}>{__PUBLISHER_PHONE__}</a>
                </p>
                <p>
                    <a id="settings-about-url" className="external" target="_blank" href={publisherUrl}>{publisherPrintUrl}</a>
                </p>
                {/*<p><label id="settings-about-info" style="display: none;"></label></p>*/}
            </div>
            <div className="content-block">
                {nameCustomer && nameCustomer.length ? (
                    <h3 id="settings-about-name" className="vendor">{nameCustomer}</h3>
                ) : null}
                {addressCustomer && addressCustomer.length ? (
                    <p>
                        <label>{_t.textAddress}</label>
                        <Link id="settings-about-address" className="external">{addressCustomer}</Link>
                    </p>
                ) : null}
                {mailCustomer && mailCustomer.length ? (
                    <p>
                        <label>{_t.textEmail}</label>
                        <Link id="settings-about-email" className="external" target="_blank" href={"mailto:"+mailCustomer}>{mailCustomer}</Link>
                    </p>
                ) : null}
                {licInfo && typeof licInfo == 'object' && typeof(customer)=='object' ? null : (
                    <p>
                        <label>{_t.textTel}</label>
                        <Link id="settings-about-tel" className="external" target="_blank" href="tel:+37163399867">+371 633-99867</Link>
                    </p>
                )}
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
            {licInfo && typeof licInfo == 'object' && typeof(customer)=='object' ? (
                <div className="content-block" id="settings-about-licensor">
                    <div className="content-block-inner"></div>
                    <p>
                        <label>{_t.textPoweredBy}</label>
                    </p>
                    <h3 className="vendor">Ascensio System SIA</h3>
                    <p>
                        <Link className="external" target="_blank" href="www.onlyoffice.com">www.onlyoffice.com</Link>
                    </p>
                </div>
            ) : null}
        </Page>
    );
};

const PresentationAbout = inject("storeAppOptions")(observer(PagePresentationAbout));

export default PresentationAbout;