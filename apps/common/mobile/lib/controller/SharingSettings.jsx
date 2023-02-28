import React, {useEffect} from 'react';
import ViewSharingSettings from "../view/SharingSettings";
import {observer, inject} from "mobx-react";

const SharingSettingsController = props => {
    const appOptions = props.storeAppOptions;
    const canRequestSharingSettings = appOptions.canRequestSharingSettings;
    const sharingSettingsUrl = appOptions.sharingSettingsUrl;

    const changeAccessRights = () => {
        if (canRequestSharingSettings) {
            Common.Gateway.requestSharingSettings();
        }
    };

    const setSharingSettings = data => {
        if (data) {
            Common.Notifications.trigger('collaboration:sharingupdate', data.sharingSettings);
        }
    }

    const onMessage = msg => {
        if(msg) {
            const msgData = JSON.parse(msg.data);

            if (msgData && msgData?.Referer == "onlyoffice") {
                if (msgData?.needUpdate) {
                    setSharingSettings(msgData.sharingSettings);
                }
                props.f7router.back();
            }
        }
    };

    const bindWindowEvents = () => {
        if (window.addEventListener) {
            window.addEventListener("message", onMessage, false);
        } else if (window.attachEvent) {
            window.attachEvent("onmessage", onMessage);
        }
    };

    const unbindWindowEvents = () => {
        if (window.removeEventListener) {
            window.removeEventListener("message", onMessage);
        } else if (window.detachEvent) {
            window.detachEvent("onmessage", onMessage);
        }
    };

    useEffect(() => {
        bindWindowEvents();
        Common.Notifications.on('collaboration:sharing', changeAccessRights);

        if (!!sharingSettingsUrl && sharingSettingsUrl.length || canRequestSharingSettings) {
            Common.Gateway.on('showsharingsettings', changeAccessRights);
            Common.Gateway.on('setsharingsettings', setSharingSettings);
        }

        return () => {
            unbindWindowEvents();
        }
    }, []);

    return (
        <ViewSharingSettings sharingSettingsUrl={sharingSettingsUrl} />
    );
};

export default inject('storeAppOptions')(observer(SharingSettingsController));