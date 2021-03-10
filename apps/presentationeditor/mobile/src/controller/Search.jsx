import React from 'react';
import { List, ListItem, Toggle } from 'framework7-react';
import { SearchController, SearchView, SearchSettingsView } from '../../../../common/mobile/lib/controller/Search';
import { f7 } from 'framework7-react';
import { useTranslation, withTranslation } from 'react-i18next';

class SearchSettings extends SearchSettingsView {
    constructor(props) {
        super(props);
    }

    extraSearchOptions() {
        const anc_markup = super.extraSearchOptions();

        const markup = <List>
                        <ListItem title="Case sensitive">
                            <Toggle slot="after" className="toggle-case-sensitive" />
                        </ListItem>
                    </List>;

        return {...anc_markup, ...markup};
    }
}

class PESearchView extends SearchView {
    searchParams() {
        let params = super.searchParams();

        const checkboxCaseSensitive = f7.toggle.get('.toggle-case-sensitive');
        const searchOptions = {
            caseSensitive: checkboxCaseSensitive.checked,
        };

        return {...params, ...searchOptions};
    }

    onSearchbarShow(isshowed, bar) {
        super.onSearchbarShow(isshowed, bar);
        
        // const api = Common.EditorApi.get();
        // if ( isshowed ) {
        //     const checkboxMarkResults = f7.toggle.get('.toggle-mark-results');
        //     api.asc_selectSearchingResults(checkboxMarkResults.checked);
        // } else api.asc_selectSearchingResults(false);
    }
}

const Search = props => {
    // const { t } = useTranslation();
    // const _t = t('View.Settings', {returnObjects: true});

    const onSearchQuery = params => {
        const api = Common.EditorApi.get();

        if (params.find && params.find.length) {
            if (!api.findText(params.find, params.forward, params.caseSensitive) ) {
                f7.dialog.alert(null, 'Text not Found');
            }
        }
    };

    const onReplaceQuery = params => {
        const api = Common.EditorApi.get();

        if (params.find && params.find.length) {
            api.asc_replaceText(params.find, params.replace, false, params.caseSensitive);
        }
    }

    const onReplaceAllQuery = params => {
        const api = Common.EditorApi.get();

        if (params.find && params.find.length) {
            api.asc_replaceText(params.find, params.replace, true, params.caseSensitive);
        }
    }

    return <PESearchView onSearchQuery={onSearchQuery} onReplaceQuery={onReplaceQuery} onReplaceAllQuery={onReplaceAllQuery} />
};

export {Search, SearchSettings}
