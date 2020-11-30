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
                <ListItem title="DOCX">
                    <Icon slot="media" icon="icon-format-docx"></Icon>
                </ListItem>
                <ListItem title="PDF">
                    <Icon slot="media" icon="icon-format-pdf"></Icon>
                </ListItem>
                <ListItem title="PDF/A">
                    <Icon slot="media" icon="icon-format-pdfa"></Icon>
                </ListItem>
                <ListItem title="TXT">
                    <Icon slot="media" icon="icon-format-txt"></Icon>
                </ListItem>
                <ListItem title="RTF">
                    <Icon slot="media" icon="icon-format-rtf"></Icon>
                </ListItem>
                <ListItem title="ODT">
                    <Icon slot="media" icon="icon-format-odt"></Icon>
                </ListItem>
                <ListItem title="HTML">
                    <Icon slot="media" icon="icon-format-html"></Icon>
                </ListItem>
                <ListItem title="DOTX">
                    <Icon slot="media" icon="icon-format-dotx"></Icon>
                </ListItem>
                <ListItem title="OTT">
                    <Icon slot="media" icon="icon-format-ott"></Icon>
                </ListItem>
            </List>
        </Page>
    )
}

const Download = observer(PageDownload);

export default Download;