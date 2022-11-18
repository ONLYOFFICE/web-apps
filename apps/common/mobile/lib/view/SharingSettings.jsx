import React, { Component, useEffect } from 'react';
import { observer, inject } from "mobx-react";
import { f7, Popover, List, ListItem, Navbar, NavRight, Sheet, BlockTitle, Page, View, Icon, Link } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { Device } from "../../utils/device";

const SharingSettings = props => {
    const { t } = useTranslation();
    const storeAppOptions = props.storeAppOptions;
    const sharingSettingsUrl = storeAppOptions.sharingSettingsUrl;
    const _t = t('Common.Collaboration', {returnObjects: true});

    return (
        <Page>
            <Navbar title={t('Common.Collaboration.textSharingSettings')} backLink={_t.textBack} />
            <div id="sharing-placeholder" className="sharing-placeholder">
                <iframe width="100%" height="100%" frameBorder={0} scrolling="0" align="top" src={sharingSettingsUrl}></iframe>
            </div>
        </Page>
    )
}

export default inject("storeAppOptions")(observer(SharingSettings));