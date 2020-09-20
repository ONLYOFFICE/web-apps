import React from 'react';
import {Page, Navbar, List, ListItem, BlockTitle} from 'framework7-react';
import { useTranslation } from 'react-i18next';

const PageDocumentSettings = (props) => {
    const { t } = useTranslation();
    const format = "A4";
    const formatSize = "21 cm x 29.7 cm";

    return (
        <Page>
            <Navbar title={t('ViewSettings.textDocumentSettings')} backLink={t('ViewSettings.textBack')} />
            <BlockTitle>{t('ViewSettings.textOrientation')}</BlockTitle>
            <List>
                <ListItem checkbox title={t('ViewSettings.textPortrait')} name="orientation-checkbox" checked={props.isPortrait} onClick={(e) => props.changePageOrient(true)}></ListItem>
                <ListItem checkbox title={t('ViewSettings.textLandscape')} name="orientation-checkbox" checked={!props.isPortrait} onClick={(e) => props.changePageOrient(false)}></ListItem>
            </List>
            <BlockTitle>{t('ViewSettings.textFormat')}</BlockTitle>
            <List mediaList>
                <ListItem title={format} subtitle={formatSize} link="/document-formats/"></ListItem>
                <ListItem checkbox title={t('ViewSettings.textMargins')} link="/margins/"></ListItem>
            </List>
        </Page>
    )
};

export default PageDocumentSettings;