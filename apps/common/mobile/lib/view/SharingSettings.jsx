import React, { useEffect } from 'react';
import { Navbar, Page } from 'framework7-react';
import { useTranslation } from 'react-i18next';

const ViewSharingSettings = props => {
    const { t } = useTranslation();
    const sharingSettingsUrl = props.sharingSettingsUrl;
    const _t = t('Common.Collaboration', {returnObjects: true});

    function resizeHeightIframe(selector) {
        const iFrame = document.querySelector(selector);
        iFrame.height = iFrame.contentWindow.document.body.scrollHeight;
    };

    useEffect(() => {
        resizeHeightIframe('#sharing-placeholder iframe');
    }, []);

    return (
        <Page>
            <Navbar title={t('Common.Collaboration.textSharingSettings')} backLink={_t.textBack} />
            <div id="sharing-placeholder" className="sharing-placeholder">
                <iframe width="100%" frameBorder={0} scrolling="0" align="top" src={sharingSettingsUrl}></iframe>
            </div>
        </Page>
    )
};

export default ViewSharingSettings;