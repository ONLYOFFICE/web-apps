import React, { useState } from 'react';
import { List, ListItem, Toggle, Page, Navbar, NavRight, Link } from 'framework7-react';
import { SearchView, SearchSettingsView } from '../../../../common/mobile/lib/controller/Search';
import { f7 } from 'framework7-react';
import { withTranslation } from 'react-i18next';
import { Device } from '../../../../common/mobile/utils/device';
import { observer, inject } from "mobx-react";

class SearchSettings extends SearchSettingsView {
    constructor(props) {
        super(props);
    }

    extraSearchOptions() {
        const anc_markup = super.extraSearchOptions();
        const show_popover = !Device.phone;
        const { t } = this.props;
        const _t = t("View.Settings", {returnObjects: true});
        const storeAppOptions = this.props.storeAppOptions;
        const storeVersionHistory = this.props.storeVersionHistory;
        const isVersionHistoryMode = storeVersionHistory.isVersionHistoryMode;
        const isEdit = storeAppOptions.isEdit;

        const markup = (
                <Page>
                    <Navbar title={isEdit ? _t.textFindAndReplace : _t.textFind}>
                        {!show_popover &&
                            <NavRight>
                                <Link popupClose=".search-settings-popup">{_t.textDone}</Link>
                            </NavRight>
                        }
                    </Navbar>
                    <List>
                        <ListItem radio title={_t.textFind} name="find-replace-checkbox" checked={!this.state.useReplace} onClick={e => this.onFindReplaceClick('find')} />
                        {isEdit && !isVersionHistoryMode ? [
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
                    </List>
                </Page>
        );

        return {...anc_markup, ...markup};
    }
}

class PESearchView extends SearchView {
    constructor(props) {
        super(props);
    }

    searchParams() {
        let params = super.searchParams();

        const checkboxCaseSensitive = f7.toggle.get('.toggle-case-sensitive');
        const searchOptions = {
            caseSensitive: checkboxCaseSensitive.checked,
        };

        return {...params, ...searchOptions};
    }

    // onSearchbarShow(isshowed, bar) {
    //     super.onSearchbarShow(isshowed, bar);
    // }
}

const Search = withTranslation()(props => {
    const { t } = props;
    const _t = t('View.Settings', {returnObjects: true});
    const [numberSearchResults, setNumberSearchResults] = useState(null);

    const onSearchQuery = (params, isSearchByTyping) => {
        const api = Common.EditorApi.get();

        f7.popover.close('.document-menu.modal-in', false);

        const options = new AscCommon.CSearchSettings();

        options.put_Text(params.find);
        options.put_MatchCase(params.caseSensitive);

        api.asc_findText(options, params.forward, function(resultCount) {
            if(!resultCount) {
                setNumberSearchResults(0);

                if(!isSearchByTyping) {
                    f7.dialog.alert(null, t('View.Settings.textNoMatches'));
                }
            } else {
                setNumberSearchResults(resultCount);
            }
        });
    };

    const onchangeSearchQuery = params => {
        const api = Common.EditorApi.get();
        
        if(params.length === 0) api.asc_selectSearchingResults(false);
    }

    const onReplaceQuery = params => {
        if (!params.find) return;

        const api = Common.EditorApi.get();
        const options = new AscCommon.CSearchSettings();

        options.put_Text(params.find);
        options.put_MatchCase(params.caseSensitive);

        api.asc_replaceText(options, params.replace || '', false);
        setNumberSearchResults(numberSearchResults > 0 ? numberSearchResults - 1 : 0);
    }

    const onReplaceAllQuery = params => {
        if (!params.find) return;

        const api = Common.EditorApi.get();
        const options = new AscCommon.CSearchSettings();

        options.put_Text(params.find);
        options.put_MatchCase(params.caseSensitive);

        api.asc_replaceText(options, params.replace || '', true);
        setNumberSearchResults(0);
    }

    return ( 
        <PESearchView 
            _t={_t} 
            onSearchQuery={onSearchQuery} 
            onchangeSearchQuery={onchangeSearchQuery} 
            onReplaceQuery={onReplaceQuery} 
            onReplaceAllQuery={onReplaceAllQuery} 
            numberSearchResults={numberSearchResults}
            setNumberSearchResults={setNumberSearchResults}
        />
    )
});

const SearchSettingsWithTranslation = inject("storeAppOptions", "storeVersionHistory")(observer(withTranslation()(SearchSettings)));

export {Search, SearchSettingsWithTranslation as SearchSettings}
