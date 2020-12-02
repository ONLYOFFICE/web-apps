import React from 'react';
// import { observer } from "mobx-react";
import { Page, Navbar, List, ListItem, BlockTitle, Icon } from "framework7-react";
import { useTranslation } from "react-i18next";

const Download = props => {
    const { t } = useTranslation();
    const _t = t("Settings", { returnObjects: true });

    return (
        <Page>
            <Navbar title={_t.textDownload} backLink={_t.textBack} />
            <BlockTitle>{_t.textDownloadAs}</BlockTitle>
            <List>
                <ListItem title="DOCX" onClick={() => props.onSaveFormat(65)}>
                    <Icon slot="media" icon="icon-format-docx"></Icon>
                </ListItem>
                <ListItem title="PDF" onClick={() => props.onSaveFormat(513)}>
                    <Icon slot="media" icon="icon-format-pdf"></Icon>
                </ListItem>
                <ListItem title="PDF/A" onClick={() => props.onSaveFormat(2305)}>
                    <Icon slot="media" icon="icon-format-pdfa"></Icon>
                </ListItem>
                <ListItem title="TXT" onClick={() => props.onSaveFormat(69)}>
                    <Icon slot="media" icon="icon-format-txt"></Icon>
                </ListItem>
                <ListItem title="RTF" onClick={() => props.onSaveFormat(68)}>
                    <Icon slot="media" icon="icon-format-rtf"></Icon>
                </ListItem>
                <ListItem title="ODT" onClick={() => props.onSaveFormat(67)}>
                    <Icon slot="media" icon="icon-format-odt"></Icon>
                </ListItem>
                <ListItem title="HTML" onClick={() => props.onSaveFormat(2051)}>
                    <Icon slot="media" icon="icon-format-html"></Icon>
                </ListItem>
                <ListItem title="DOTX" onClick={() => props.onSaveFormat(76)}>
                    <Icon slot="media" icon="icon-format-dotx"></Icon>
                </ListItem>
                <ListItem title="OTT" onClick={() => props.onSaveFormat(79)}>
                    <Icon slot="media" icon="icon-format-ott"></Icon>
                </ListItem>
            </List>
        </Page>
    )
}

export default Download;