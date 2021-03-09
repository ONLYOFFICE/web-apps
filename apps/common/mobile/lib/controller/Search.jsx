import React from 'react';
import SearchView, {SearchSettingsView} from '../view/Search';
import { useTranslation, withTranslation } from 'react-i18next';


const SearchController = props => {
    const onSearchQuery = params => {
        console.log('on search: ' + params);
    };

    return <SearchView onSearchQuery={onSearchQuery} />
};

export {SearchController, SearchView, SearchSettingsView};
