// import React, {useState} from "react";
// import { observer, inject } from "mobx-react";
// import { Page, Navbar, List, ListItem } from "framework7-react";
// import { useTranslation } from "react-i18next";

// const PageEffect= props => {
//     const { t } = useTranslation();
//     const _t = t("View.Edit", { returnObjects: true });
//     console.log(props);
//     const arrEffect = props.arrEffect;
//     const effect = props.effect;
    
//     return (
//         <Page>
//             <Navbar title={_t.textEffect} backLink={_t.textBack} />
//             {arrEffect.length ? (
//                 <List mediaList>
//                     {arrEffect.map((elem, index) => {
//                         return (
//                             <ListItem key={index} radio name="editslide-effect" title={elem.displayValue} value={elem.value} 
//                                 checked={elem.value === effect}></ListItem>
//                         )
//                     })}
//                 </List>
//             ) : null}
//         </Page>
//     );
// };

// const Effect = inject("storeEffect")(observer(PageEffect));

// export default Effect;