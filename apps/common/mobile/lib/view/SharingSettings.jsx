import React, { useEffect, useRef } from 'react';
import { Navbar, Page } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { Device } from '../../utils/device';

const frameStyle = {
    width: '100%',
    height: '100%',
    minHeight: 380
}

const ViewSharingSettings = props => {
    const { t } = useTranslation();
    const sharingSettingsUrl = props.sharingSettingsUrl;
    const _t = t('Common.Collaboration', {returnObjects: true});
    const ref = useRef(null);

    useEffect(() => {
        const coauthSheetElem = ref.current.closest('.coauth__sheet');

        if(Device.phone) {
            coauthSheetElem.style.height = '100%';
            coauthSheetElem.style.maxHeight = '100%';
        }

        return () => {
            if(Device.phone) {
                coauthSheetElem.style.height = null;
                coauthSheetElem.style.maxHeight = '65%';
            }
        }
    }, []);

    return (
        <Page>
            <Navbar title={t('Common.Collaboration.textSharingSettings')} backLink={_t.textBack} />
            <div id="sharing-placeholder" className="sharing-placeholder" ref={ref}>
                <iframe style={frameStyle} frameBorder={0} scrolling="0" align="top" src={sharingSettingsUrl}></iframe>
            </div>
        </Page>
    )
};

export default ViewSharingSettings;