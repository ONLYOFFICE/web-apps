import React, { useEffect, useState } from 'react';
import { inject } from 'mobx-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import Preview from "../view/Preview";

const PreviewController = () => {
    console.log('preview');
    return (
        <Preview />
    )
};

export {PreviewController as Preview};



