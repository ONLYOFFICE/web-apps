import React, { useState } from 'react';
import { Device } from '../../../../../common/mobile/utils/device';

const PasswordField = ({ label, placeholder, value, handlerChange, maxLength }) => {
    const [password, setPassword] = useState(value);
    const [isShowPassword, setShowPassword] = useState(false);
    const isIos = Device.ios;

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        handlerChange(e.target.value);
    };

    const toggleShowPassword = () => {
        setShowPassword(!isShowPassword);
    };

    return (
        <li>
            <div className='item-content item-input password-field'>
                <div className='item-inner'>
                    <div className='item-title item-label password-field__label'>{label}</div>
                    <div className='item-input-wrap password-field__wrap'>
                        <input type={isShowPassword ? 'type' : 'password'} placeholder={placeholder} value={password} onChange={handlePasswordChange} className='password-field__input' maxLength={maxLength || null} />
                        {!isIos && 
                            <i className={`icon password-field__icon ${isShowPassword ? 'icon-hide-password' : 'icon-show-password'}`} onClick={toggleShowPassword}></i>
                        }
                    </div>
                </div>
            </div>
        </li>
    );
};

export default PasswordField;