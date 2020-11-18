import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";
import {Page, Navbar, List, ListItem, ListButton, Row, BlockTitle, Range, Toggle} from 'framework7-react';
import { useTranslation } from 'react-i18next';

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
                <ListItem title={_t.textInline} radio checked={wrapType === 'inline'} onClick={() => {props.onWrapType(c_tableWrap.TABLE_WRAP_NONE)}}></ListItem>
                <ListItem title={_t.textFlow} radio checked={wrapType === 'flow'} onClick={() => {props.onWrapType(c_tableWrap.TABLE_WRAP_PARALLEL)}}></ListItem>
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
                        <ListItem>
                            <Row>
                                <a className={'button' + (align === c_tableAlign.TABLE_ALIGN_LEFT ? ' active' : '')}
                                   onClick={() => {
                                       props.onWrapAlign(c_tableAlign.TABLE_ALIGN_LEFT)
                                   }}>left</a>
                                <a className={'button' + (align === c_tableAlign.TABLE_ALIGN_CENTER ? ' active' : '')}
                                   onClick={() => {
                                       props.onWrapAlign(c_tableAlign.TABLE_ALIGN_CENTER)
                                   }}>center</a>
                                <a className={'button' + (align === c_tableAlign.TABLE_ALIGN_RIGHT ? ' active' : '')}
                                   onClick={() => {
                                       props.onWrapAlign(c_tableAlign.TABLE_ALIGN_RIGHT)
                                   }}>right</a>
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
                <ListItem>
                    <Row>
                        <a className={'button'} onClick={() => {props.onAddColumnLeft()}}>col-left</a>
                        <a className={'button'} onClick={() => {props.onAddColumnRight()}}>col-right</a>
                        <a className={'button'} onClick={() => {props.onAddRowAbove()}}>row-above</a>
                        <a className={'button'} onClick={() => {props.onAddRowBelow()}}>row-below</a>
                    </Row>
                </ListItem>
                <ListItem>
                    <Row>
                        <a className={'button'} onClick={() => {props.onRemoveColumn()}}>remove-column</a>
                        <a className={'button'} onClick={() => {props.onRemoveRow()}}>remove-row</a>
                    </Row>
                </ListItem>
                <ListButton title={_t.textRemoveTable} onClick={() => {props.onRemoveTable()}}></ListButton>
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