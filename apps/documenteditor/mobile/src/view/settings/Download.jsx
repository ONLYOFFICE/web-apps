import React from 'react';
import { observer } from "mobx-react";
import { Page, Navbar, List, ListItem, BlockTitle, Icon } from "framework7-react";
import { useTranslation } from "react-i18next";

const PageDownload = props => {
    const { t } = useTranslation();
    const _t = t("Settings", { returnObjects: true });

    return (
        <Page>
            <Navbar title={_t.textDownload} backLink={_t.textBack} />
            <BlockTitle>{_t.textDownloadAs}</BlockTitle>
            <List>
                <ListItem title="DOCX" radio={true} value="65" data-format="65" onChange={e => props.onSaveFormat(e.target.value)}>
                    <Icon slot="media" icon="icon-format-docx"></Icon>
                </ListItem>
                <ListItem title="PDF" radio={true} value="513" data-format="513" onChange={e => props.onSaveFormat(e.target.value)}>
                    <Icon slot="media" icon="icon-format-pdf"></Icon>
                </ListItem>
                <ListItem title="PDF/A" radio={true} value="2305" data-format="2305" onChange={e => props.onSaveFormat(e.target.value)}>
                    <Icon slot="media" icon="icon-format-pdfa"></Icon>
                </ListItem>
                <ListItem title="TXT" radio={true} value="69" data-format="69" onChange={e => props.onSaveFormat(e.target.value)}>
                    <Icon slot="media" icon="icon-format-txt"></Icon>
                </ListItem>
                <ListItem title="RTF" radio={true} value="68" data-format="68" onChange={e => props.onSaveFormat(e.target.value)}>
                    <Icon slot="media" icon="icon-format-rtf"></Icon>
                </ListItem>
                <ListItem title="ODT" radio={true} value="67" data-format="67" onChange={e => props.onSaveFormat(e.target.value)}>
                    <Icon slot="media" icon="icon-format-odt"></Icon>
                </ListItem>
                <ListItem title="HTML" radio={true} value="2051" data-format="2051" onChange={e => props.onSaveFormat(e.target.value)}>
                    <Icon slot="media" icon="icon-format-html"></Icon>
                </ListItem>
                <ListItem title="DOTX" radio={true} value="76" data-format="76" onChange={e => props.onSaveFormat(e.target.value)}>
                    <Icon slot="media" icon="icon-format-dotx"></Icon>
                </ListItem>
                <ListItem title="OTT" radio={true} value="79" data-format="79" onChange={e => props.onSaveFormat(e.target.value)}>
                    <Icon slot="media" icon="icon-format-ott"></Icon>
                </ListItem>
            </List>
        </Page>
    )
}

const Download = observer(PageDownload);

export default Download;