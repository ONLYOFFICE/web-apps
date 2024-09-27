import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import { withTranslation } from 'react-i18next';
import {observer, inject} from "mobx-react";

import AddSortAndFilter from '../../view/add/AddFilter';

class AddFilterController extends Component {
    constructor (props) {
        super(props);
        this.onInsertFilter = this.onInsertFilter.bind(this);
        this.uncheckedFilter = this.uncheckedFilter.bind(this);
        this.onInsertSort = this.onInsertSort.bind(this);

        const api = Common.EditorApi.get();

        const filterInfo = api.asc_getCellInfo().asc_getAutoFilterInfo();
        const isFilter = (filterInfo ? filterInfo.asc_getIsAutoFilter() : false);

        this.state = {
            isFilter: isFilter
        };
    }

    componentDidMount () {
        const api = Common.EditorApi.get();
        const appOptions = this.props.storeAppOptions;

        api.asc_setFilteringMode && api.asc_setFilteringMode(appOptions.canModifyFilter);
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
        const { t } = this.props;
        const _t = t('View.Add', {returnObjects: true});

        f7.popup.close('.add-popup');
        f7.popover.close('#add-popover');
        
        let typeCheck = type == 'down' ? Asc.c_oAscSortOptions.Ascending : Asc.c_oAscSortOptions.Descending;
        let res = api.asc_sortCellsRangeExpand();
        switch (res) {
            case Asc.c_oAscSelectionSortExpand.showExpandMessage:
                f7.dialog.create({
                    title: _t.txtSorting,
                    text: _t.txtExpandSort,
                    buttons: [
                        {
                            text: _t.txtExpand,
                            bold: true,
                            onClick: () => {
                                api.asc_sortColFilter(typeCheck, '', undefined, undefined, true);
                            }
                        },
                        {
                            text: _t.txtSortSelected,
                            bold: true,
                            onClick: () => {
                                api.asc_sortColFilter(typeCheck, '', undefined, undefined);
                            }
                        },
                        {
                            text: _t.textCancel
                        }
                    ],
                    verticalButtons: true
                }).open();
                break;
            case Asc.c_oAscSelectionSortExpand.showLockMessage:
                f7.dialog.create({
                    title: _t.txtSorting,
                    text: _t.txtLockSort,
                    buttons: [
                        {
                            text: _t.txtYes,
                            bold: true,
                            onClick: () => {
                                api.asc_sortColFilter(typeCheck, '', undefined, undefined, false);
                            }
                        },
                        {
                            text: _t.txtNo
                        }
                    ],
                    verticalButtons: true
                }).open();
                break;
            case Asc.c_oAscSelectionSortExpand.expandAndNotShowMessage:
            case Asc.c_oAscSelectionSortExpand.notExpandAndNotShowMessage:
                api.asc_sortColFilter(typeCheck, '', undefined, undefined, res === Asc.c_oAscSelectionSortExpand.expandAndNotShowMessage);
                break;
        }
    }

    onInsertFilter (checked) {
        this.setState({isFilter: checked});
        const api = Common.EditorApi.get();
        const formatTableInfo = api.asc_getCellInfo().asc_getFormatTableInfo();
        const tablename = (formatTableInfo) ? formatTableInfo.asc_getTableName() : undefined;
        
        if (checked || tablename) {
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
                              wsLock={this.props.storeWorksheets.wsLock}
            />
        )
    }
}

export default inject("storeWorksheets", "storeAppOptions")(observer(withTranslation()(AddFilterController)));