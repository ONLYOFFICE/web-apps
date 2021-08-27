import React from 'react';
import { List, ListItem, Toggle, Page, Navbar, NavRight, Link } from 'framework7-react';
import { SearchController, SearchView, SearchSettingsView } from '../../../../common/mobile/lib/controller/Search';
import { f7 } from 'framework7-react';
import { withTranslation } from 'react-i18next';
import { Device } from '../../../../common/mobile/utils/device';
import { observer, inject } from "mobx-react";

class SearchSettings extends SearchSettingsView {
    constructor(props) {
        super(props);

        this.onToggleMarkResults = this.onToggleMarkResults.bind(this);
    }

    onToggleMarkResults(checked) {
        const api = Common.EditorApi.get();
        api.asc_selectSearchingResults(checked);
    }

    extraSearchOptions() {
        const anc_markup = super.extraSearchOptions();
        const show_popover = !Device.phone;
        const { t } = this.props;
        const _t = t("Settings", {returnObjects: true});
        const storeAppOptions = this.props.storeAppOptions;
        const isEdit = storeAppOptions.isEdit;

        const markup = (
                <Page>
                    <Navbar title={_t.textFindAndReplace}>
                        {!show_popover &&
                            <NavRight>
                                <Link popupClose=".search-settings-popup">{_t.textDone}</Link>
                            </NavRight>
                        }
                    </Navbar>
                    <List>
                        <ListItem radio title={_t.textFind} name="find-replace-checkbox" checked={!this.state.useReplace} onClick={e => this.onFindReplaceClick('find')} />
                        {isEdit ? [
                            <ListItem key="replace" radio title={_t.textFindAndReplace} name="find-replace-checkbox" checked={this.state.useReplace} 
                                onClick={e => this.onFindReplaceClick('replace')} />, 
                            <ListItem key="replace-all" radio title={_t.textFindAndReplaceAll} name="find-replace-checkbox" checked={this.state.isReplaceAll}
                                onClick={() => this.onFindReplaceClick('replace-all')}></ListItem>]
                        : null}
                    </List>
                    <List>
                        <ListItem title={_t.textCaseSensitive}>
                            <Toggle slot="after" className="toggle-case-sensitive" />
                        </ListItem>
                        <ListItem title={_t.textHighlightResults}>
                            <Toggle slot="after" className="toggle-mark-results" defaultChecked onToggleChange={this.onToggleMarkResults} />
                        </ListItem>
                    </List>
                </Page>
        );

        return {...anc_markup, ...markup};
    }
}

class DESearchView extends SearchView {
    constructor(props) {
        super(props);
    }

    searchParams() {
        let params = super.searchParams();

        const checkboxCaseSensitive = f7.toggle.get('.toggle-case-sensitive'),
            checkboxMarkResults = f7.toggle.get('.toggle-mark-results');
        const searchOptions = {
            caseSensitive: checkboxCaseSensitive.checked,
            highlight: checkboxMarkResults.checked
        };

        return {...params, ...searchOptions};
    }

    onSearchbarShow(isshowed, bar) {
        super.onSearchbarShow(isshowed, bar);

        const api = Common.EditorApi.get();
        if ( isshowed ) {
            const checkboxMarkResults = f7.toggle.get('.toggle-mark-results');
            api.asc_selectSearchingResults(checkboxMarkResults.checked);
        } else api.asc_selectSearchingResults(false);
    }
}

const Search = withTranslation()(props => {
    const { t } = props;
    const _t = t('Settings', {returnObjects: true});

    const onSearchQuery = params => {
        const api = Common.EditorApi.get();

        if (params.find && params.find.length) {
            if (!api.asc_findText(params.find, params.forward, params.caseSensitive, params.highlight) ) {
                f7.dialog.alert(null, _t.textNoTextFound);
            }
        }
    };

    const onReplaceQuery = params => {
        const api = Common.EditorApi.get();

        if (params.find && params.find.length) {
            api.asc_replaceText(params.find, params.replace || '', false, params.caseSensitive, params.highlight);
        }
    }

    const onReplaceAllQuery = params => {
        const api = Common.EditorApi.get();

        if (params.find && params.find.length) {
            api.asc_replaceText(params.find, params.replace || '', true, params.caseSensitive, params.highlight);
        }
    }

    return <DESearchView _t={_t} onSearchQuery={onSearchQuery} onReplaceQuery={onReplaceQuery} onReplaceAllQuery={onReplaceAllQuery} />
});

const SearchSettingsWithTranslation = inject("storeAppOptions")(observer(withTranslation()(SearchSettings)));

export {Search, SearchSettingsWithTranslation as SearchSettings}
