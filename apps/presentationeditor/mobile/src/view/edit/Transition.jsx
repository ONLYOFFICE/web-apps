import React, {useState} from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, NavRight, Link, Toggle, Range, ListItemCell } from "framework7-react";
import { useTranslation } from "react-i18next";

const PageTransition = props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });
    const [stateRange, changeRange] = useState(0);
    const store = props.storeTransition;
    const isDelay = store.isDelay;
    // const dataApp = props.getAppProps();
    // const dataModified = props.getModified;
    // const dataModifiedBy = props.getModifiedBy;
    // const creators = props.getCreators;
    // const dataDoc = JSON.parse(JSON.stringify(storeInfo.dataDoc));
    
    return (
        <Page className="slide-transition">
            <Navbar title={_t.textTransition} backLink={_t.textBack}>
                <NavRight>
                    <Link icon='icon-expand-down' sheetClose></Link>
                </NavRight>
            </Navbar>
            <List>
                <ListItem link="/effect/" title={_t.textEffect} after="None"></ListItem>
                <ListItem link="/type/" title={_t.textType}>
                    <div slot="after"></div>
                </ListItem>
                <ListItem title={_t.textDuration}>
                    <div slot="after" className="splitter">
                        <label>2 s</label>
                        <p className="buttons-row">
                            <span className="button">-</span>  
                            <span className="button">+</span>
                        </p>
                    </div>
                </ListItem>
            </List>
            <List>
                <ListItem>
                    <span>{_t.textStartOnClick}</span>
                    <Toggle />
                </ListItem>
                <ListItem>
                    <span>{_t.textDelay}</span>
                    <Toggle checked={isDelay} onChange={store.toggleDelay.bind(store)} />
                </ListItem>
                <ListItem>
                    <ListItemCell className="flex-shrink-3">
                        <Range min={0} max={300} step={1} value={stateRange} onRangeChange={changeRange.bind(this)} disabled={!isDelay}></Range>
                    </ListItemCell>
                    <ListItemCell className="width-auto flex-shrink-0">
                        <span>{stateRange} s</span>
                    </ListItemCell>
                </ListItem>
            </List>
            <List>
                <ListItem className="slide-apply-all">{_t.textApplyAll}</ListItem>
            </List>
        </Page>
    );
};

const Transition = inject("storeTransition")(observer(PageTransition));

export default Transition;