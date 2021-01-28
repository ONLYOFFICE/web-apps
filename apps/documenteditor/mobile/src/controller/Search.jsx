import React from 'react';
import { List, ListItem, Toggle } from 'framework7-react';
import { SearchController, SearchView, SearchSettingsView } from '../../../../common/mobile/lib/controller/Search';
import { f7 } from 'framework7-react';


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
                        <ListItem title="Highlight results">
                            <Toggle slot="after" className="toggle-mark-results" defaultChecked />
                        </ListItem>
                    </List>;

        return {...anc_markup, ...markup};
    }
}

class DESearchView extends SearchView {
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
}

const Search = props => {
    const onSearchQuery = params => {
        console.log('on search: ' + params.find);
    };

    return <DESearchView onSearchQuery={onSearchQuery} />
};

export {Search, SearchSettings}
