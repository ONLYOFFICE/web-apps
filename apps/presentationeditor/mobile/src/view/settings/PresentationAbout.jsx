import React, { Fragment } from 'react';
import { observer, inject } from "mobx-react";
import { Page, Navbar } from "framework7-react";
import { useTranslation } from "react-i18next";

const PagePresentationAbout = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const store = props.storeAppOptions;
    const isCanBranding = store.canBranding;
    const licInfo = isCanBranding ? store.customization : null;
    let customer;
    let nameCustomer;
    let addressCustomer;
    let mailCustomer;
    let urlCustomer;
    let infoCustomer;
    let logoCustomer;

    if(licInfo) {
        customer = licInfo.customer;
        nameCustomer = customer.name;
        addressCustomer = customer.address;
        mailCustomer = customer.mail;
        urlCustomer = customer.www;
        infoCustomer = customer.info;
        logoCustomer = customer.logo;
    }

    console.log(store);
    console.log(isCanBranding);

    return (
        <Page className="about">
            <Navbar title={_t.textAbout} backLink={_t.textBack} />
            <div className="content-block">
                {licInfo && typeof licInfo == 'object' && typeof(licInfo.customer)=='object' ? null : (
                    <div className="logo"></div>
                )}
                {logoCustomer && logoCustomer.length ? (
                    <div id="settings-about-logo" style={{marginTop: "20px"}}>
                        <img src={logoCustomer} style={{maxWidth: "216px", maxHeight: "35px"}} />
                    </div>
                ) : null}
            </div>
            <div className="content-block">
                <h3>PRESENTATION EDITOR</h3>
                <h3>{_t.textVersion} 6.1.1</h3>
            </div>
            <div className="content-block">
                {nameCustomer && nameCustomer.length ? (
                    <h3 id="settings-about-name" className="vendor">{nameCustomer}</h3>
                ) : null}
                {addressCustomer && addressCustomer.length ? (
                    <p>
                        <label>{_t.textAddress}</label>
                        <a id="settings-about-address" className="external" href="#">{addressCustomer}</a>
                    </p>
                ) : null}
                {mailCustomer && mailCustomer.length ? (
                    <p>
                        <label>{_t.textEmail}</label>
                        <a id="settings-about-email" className="external" target="_blank" href={"mailto:"+mailCustomer}>{mailCustomer}</a>
                    </p>
                ) : null}
                {licInfo && typeof licInfo == 'object' && typeof(licInfo.customer)=='object' ? null : (
                    <p>
                        <label>{_t.textTel}</label>
                        <a id="settings-about-tel" className="external" target="_blank" href="tel:+37163399867>">+371 633-99867</a>
                    </p>
                )}
                {urlCustomer && urlCustomer.length ? (
                    <p>
                        <a id="settings-about-url" className="external" target="_blank" 
                            href={!/^https?:\/{2}/i.test(urlCustomer) ? "http:\/\/" : '' + urlCustomer}>
                            {urlCustomer}
                        </a>
                    </p>
                ) : null} 
                {infoCustomer && infoCustomer.length ? (
                    <p>
                        <label id="settings-about-info">{infoCustomer}</label>
                    </p>
                ) : null}
            </div>
            {licInfo && typeof licInfo == 'object' && typeof(licInfo.customer)=='object' ? (
                <div className="content-block" id="settings-about-licensor">
                    <div className="content-block-inner"></div>
                    <p>
                        <label>{_t.textPoweredBy}</label>
                    </p>
                    <h3 className="vendor">Ascensio System SIA</h3>
                    <p>
                        <a className="external" target="_blank" href="www.onlyoffice.com">www.onlyoffice.com</a>
                    </p>
                </div>
            ) : null}
        </Page>
    );
};

const PresentationAbout = inject("storeAppOptions")(observer(PagePresentationAbout));

export default PresentationAbout;