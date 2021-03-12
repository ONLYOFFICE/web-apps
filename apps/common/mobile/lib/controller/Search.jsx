import React from 'react';
import {SearchView, SearchSettingsView} from '../view/Search';

const SearchController = props => {
    const onSearchQuery = params => {
        console.log('on search: ' + params);
    };

    return <SearchView onSearchQuery={onSearchQuery}  />
};

export {SearchController, SearchView, SearchSettingsView};
