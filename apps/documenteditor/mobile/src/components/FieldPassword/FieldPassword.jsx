import React, { useState } from 'react';
import { ListInput, Icon } from "framework7-react";
import { Device } from '../../../../../common/mobile/utils/device';

const FieldPassword = ({ label, value, onInput, placeholder }) => {
    const isIos = Device.ios;
    const [isShowPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!isShowPassword);
    };

    return (
        <ListInput 
            // className="list-input-right"
            label={label}
            type={isShowPassword ? "text" : "password"}
            placeholder={placeholder}
            value={value}
            onInput={onInput}
            className={isIos ? 'list-input-right' : ''}
        >
            {/* <Icon icon="icon-show-password" slot="inner-end" onClick={toggleShowPassword} /> */}
        </ListInput>
    );
}

export default FieldPassword;