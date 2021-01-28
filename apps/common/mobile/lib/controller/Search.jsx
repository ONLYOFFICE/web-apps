import React from 'react';
import SearchView, {SearchSettingsView} from '../view/Search'


const SearchController = props => {
    const _onSearchQuery = params => {
        console.log('on search: ' + params);
    };

    return <SearchView onSearchQuery={_onSearchQuery} />
};

export {SearchController as Search, SearchSettingsView as SearchSettings};
