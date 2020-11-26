import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";
import {Page, Navbar, List, ListItem, ListButton, Row, BlockTitle, Range, Toggle, Icon} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';

const PageTableOptions = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const metricText = Common.Utils.Metric.getCurrentMetricName();
    const storeFocusObjects = props.storeFocusObjects;
    const tableObject = storeFocusObjects.tableObject;
    const storeTableSettings = props.storeTableSettings;
    const distance = Common.Utils.Metric.fnRecalcFromMM(storeTableSettings.getCellMargins(tableObject));
    const [stateDistance, setDistance] = useState(distance);
    const isRepeat = storeTableSettings.getRepeatOption(tableObject);
    const isResize = storeTableSettings.getResizeOption(tableObject);
    return (
        <Page>
            <Navbar title={_t.textOptions} backLink={_t.textBack} />
            <List>
                <ListItem title={_t.textRepeatAsHeaderRow} className={isRepeat === null ? 'disabled' : ''}>
                    <Toggle checked={isRepeat} onToggleChange={() => {props.onOptionRepeat(!isRepeat)}}/>
                </ListItem>
                <ListItem title={_t.textResizeToFitContent}>
                    <Toggle checked={isResize} onToggleChange={() => {props.onOptionResize(!isResize)}}/>
                </ListItem>
            </List>
            <BlockTitle>{_t.textCellMargins}</BlockTitle>
            <List>
                <ListItem>
                    <div slot='inner' style={{width: '100%'}}>
                        <Range min={0} max={200} step={1} value={stateDistance}
                               onRangeChange={(value) => {setDistance(value)}}
                               onRangeChanged={(value) => {props.onCellMargins(value)}}
                        ></Range>
                    </div>
                    <div slot='inner-end' style={{minWidth: '60px', textAlign: 'right'}}>
                        {stateDistance + ' ' + metricText}
                    </div>
                </ListItem>
            </List>
        </Page>
    )
};

const PageWrap = props => {
    const c_tableWrap = {
        TABLE_WRAP_NONE: 0,
        TABLE_WRAP_PARALLEL: 1
    };
    const c_tableAlign = {
        TABLE_ALIGN_LEFT: 0,
        TABLE_ALIGN_CENTER: 1,
        TABLE_ALIGN_RIGHT: 2
    };
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const storeTableSettings = props.storeTableSettings;
    const tableObject = props.storeFocusObjects.tableObject;
    const wrapType = storeTableSettings.getWrapType(tableObject);
    const align = storeTableSettings.getAlign(tableObject);
    const moveText = storeTableSettings.getMoveText(tableObject);
    const distance = Common.Utils.Metric.fnRecalcFromMM(storeTableSettings.getWrapDistance(tableObject));
    const metricText = Common.Utils.Metric.getCurrentMetricName();
    const [stateDistance, setDistance] = useState(distance);
    return (
        <Page>
            <Navbar title={_t.textWrap} backLink={_t.textBack} />
            <List>
                <ListItem title={_t.textInline} radio checked={wrapType === 'inline'} onClick={() => {props.onWrapType(c_tableWrap.TABLE_WRAP_NONE)}}>
                    {!isAndroid && <Icon slot="media" icon="icon-wrap-table-inline"></Icon>}
                </ListItem>
                <ListItem title={_t.textFlow} radio checked={wrapType === 'flow'} onClick={() => {props.onWrapType(c_tableWrap.TABLE_WRAP_PARALLEL)}}>
                    {!isAndroid && <Icon slot="media" icon="icon-wrap-table-flow"></Icon>}
                </ListItem>
            </List>
            <List>
                <ListItem title={_t.textMoveWithText} className={'inline' === wrapType ? 'disabled' : ''}>
                    <Toggle checked={moveText} onToggleChange={() => {props.onWrapMoveText(!moveText)}}/>
                </ListItem>
            </List>
            {
                wrapType === 'inline' &&
                <Fragment>
                    <BlockTitle>{_t.textAlign}</BlockTitle>
                    <List>
                        <ListItem className='buttons'>
                            <Row>
                                <a className={'button' + (align === c_tableAlign.TABLE_ALIGN_LEFT ? ' active' : '')}
                                   onClick={() => {
                                       props.onWrapAlign(c_tableAlign.TABLE_ALIGN_LEFT)
                                   }}>
                                    <Icon slot="media" icon="icon-block-align-left"></Icon>
                                </a>
                                <a className={'button' + (align === c_tableAlign.TABLE_ALIGN_CENTER ? ' active' : '')}
                                   onClick={() => {
                                       props.onWrapAlign(c_tableAlign.TABLE_ALIGN_CENTER)
                                   }}>
                                    <Icon slot="media" icon="icon-block-align-center"></Icon>
                                </a>
                                <a className={'button' + (align === c_tableAlign.TABLE_ALIGN_RIGHT ? ' active' : '')}
                                   onClick={() => {
                                       props.onWrapAlign(c_tableAlign.TABLE_ALIGN_RIGHT)
                                   }}>
                                    <Icon slot="media" icon="icon-block-align-right"></Icon>
                                </a>
                            </Row>
                        </ListItem>
                    </List>
                </Fragment>
            }
            {
                (wrapType === 'flow') &&
                <Fragment>
                    <BlockTitle>{_t.textDistanceFromText}</BlockTitle>
                    <List>
                        <ListItem>
                            <div slot='inner' style={{width: '100%'}}>
                                <Range min={0} max={200} step={1} value={stateDistance}
                                       onRangeChange={(value) => {setDistance(value)}}
                                       onRangeChanged={(value) => {props.onWrapDistance(value)}}
                                ></Range>
                            </div>
                            <div slot='inner-end' style={{minWidth: '60px', textAlign: 'right'}}>
                                {stateDistance + ' ' + metricText}
                            </div>
                        </ListItem>
                    </List>
                </Fragment>
            }
        </Page>
    )
};

const PageStyle = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    return (
        <Page>
        </Page>
    )
};

const EditTable = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    return (
        <Fragment>
            <List>
                <ListItem className='buttons'>
                    <Row>
                        <a className={'item-link button'} onClick={() => {props.onAddColumnLeft()}}>
                            <Icon slot="media" icon="icon-table-add-column-left"></Icon>
                        </a>
                        <a className={'item-link button'} onClick={() => {props.onAddColumnRight()}}>
                            <Icon slot="media" icon="icon-table-add-column-right"></Icon>
                        </a>
                        <a className={'item-link button'} onClick={() => {props.onAddRowAbove()}}>
                            <Icon slot="media" icon="icon-table-add-row-above"></Icon>
                        </a>
                        <a className={'item-link button'} onClick={() => {props.onAddRowBelow()}}>
                            <Icon slot="media" icon="icon-table-add-row-below"></Icon>
                        </a>
                    </Row>
                </ListItem>
                <ListItem className='buttons'>
                    <Row>
                        <a className={'item-link button'} onClick={() => {props.onRemoveColumn()}}>
                            <Icon slot="media" icon="icon-table-remove-column"></Icon>
                        </a>
                        <a className={'item-link button'} onClick={() => {props.onRemoveRow()}}>
                            <Icon slot="media" icon="icon icon-table-remove-row"></Icon>
                        </a>
                    </Row>
                </ListItem>
                <ListButton title={_t.textRemoveTable} onClick={() => {props.onRemoveTable()}} className='button-red button-fill button-raised'></ListButton>
            </List>
            <List>
                <ListItem title={_t.textTableOptions} link='/edit-table-options/' routeProps={{
                    onCellMargins: props.onCellMargins,
                    onOptionResize: props.onOptionResize,
                    onOptionRepeat: props.onOptionRepeat
                }}></ListItem>
                <ListItem title={_t.textStyle} link='/edit-table-style/'></ListItem>
                <ListItem title={_t.textWrap} link='/edit-table-wrap/' routeProps={{
                    onWrapType: props.onWrapType,
                    onWrapAlign: props.onWrapAlign,
                    onWrapMoveText: props.onWrapMoveText,
                    onWrapDistance: props.onWrapDistance
                }}></ListItem>
            </List>
        </Fragment>
    )
};

const EditTableContainer = inject("storeFocusObjects")(observer(EditTable));
const PageTableOptionsContainer = inject("storeFocusObjects","storeTableSettings")(observer(PageTableOptions));
const PageWrapContainer = inject("storeFocusObjects","storeTableSettings")(observer(PageWrap));
const PageStyleContainer = inject("storeFocusObjects","storeTableSettings")(observer(PageStyle));

export {EditTableContainer as EditTable,
        PageTableOptionsContainer as PageTableOptions,
        PageWrapContainer as PageTableWrap,
        PageStyleContainer as PageTableStyle}