
import React from 'react';
import { f7 } from 'framework7-react';

class Device {
    constructor(){
        const ua = navigator.userAgent,
            isMobile = /Mobile(\/|\s|;)/.test(ua);

        this.isPhone = /(iPhone|iPod)/.test(ua) ||
            (!/(Silk)/.test(ua) && (/(Android)/.test(ua) && (/(Android 2)/.test(ua) || isMobile))) ||
            (/(BlackBerry|BB)/.test(ua) && isMobile) ||
            /(Windows Phone)/.test(ua);

        this.isTablet = !this.isPhone && (/iPad/.test(ua) || /Android/.test(ua) || /(RIM Tablet OS)/.test(ua) ||
            (/MSIE 10/.test(ua) && /; Touch/.test(ua)));
    }

    get phone() {
        return this.isPhone
    }

    get tablet() {
        return this.isTablet
    }

    get sailfish() {
        return /Sailfish/.test(navigator.userAgent) || /Jolla/.test(navigator.userAgent);
    }

    get android() {
        return f7.device.android;
    }

    get ios() {
        return f7.device.ios;
    }
}

const device = new Device();
export {device as Device};
