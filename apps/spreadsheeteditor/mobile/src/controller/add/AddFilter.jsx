import React, {Component} from 'react';

import AddSortAndFilter from '../../view/add/AddFilter';

class AddFilterController extends Component {
    constructor (props) {
        super(props);
        this.onInsertFilter = this.onInsertFilter.bind(this);
        this.uncheckedFilter = this.uncheckedFilter.bind(this);

        const api = Common.EditorApi.get();

        const filterInfo = api.asc_getCellInfo().asc_getAutoFilterInfo();
        const isFilter = (filterInfo ? filterInfo.asc_getIsAutoFilter() : false);

        this.state = {
            isFilter: isFilter
        };
    }

    componentDidMount () {
        const api = Common.EditorApi.get();
        api.asc_registerCallback('asc_onError', this.uncheckedFilter);
    }

    componentWillUnmount () {
        const api = Common.EditorApi.get();
        api.asc_unregisterCallback('asc_onError', this.uncheckedFilter);
    }

    uncheckedFilter (id, level, errData) {
        setTimeout(() => {
            if (id === Asc.c_oAscError.ID.AutoFilterDataRangeError) {
                this.setState({isFilter: false});
            }
        }, 0);
    }

    onInsertSort (type) {
        const api = Common.EditorApi.get();
        api.asc_sortColFilter(type == 'down' ? Asc.c_oAscSortOptions.Ascending : Asc.c_oAscSortOptions.Descending, '', undefined, undefined, true);
    }

    onInsertFilter (checked) {
        this.setState({isFilter: checked});
        const api = Common.EditorApi.get();
        const formatTableInfo = api.asc_getCellInfo().asc_getFormatTableInfo();
        const tablename = (formatTableInfo) ? formatTableInfo.asc_getTableName() : undefined;
        if (checked) {
            api.asc_addAutoFilter();
        } else {
            api.asc_changeAutoFilter(tablename, Asc.c_oAscChangeFilterOptions.filter, checked);
        }
    }

    render () {
        return (
            <AddSortAndFilter getIsAutoFilter={this.getIsAutoFilter}
                              onInsertSort={this.onInsertSort}
                              onInsertFilter={this.onInsertFilter}
                              isFilter={this.state.isFilter}
            />
        )
    }
}

export default AddFilterController;