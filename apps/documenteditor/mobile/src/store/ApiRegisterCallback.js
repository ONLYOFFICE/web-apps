import React from "react";
import { resetPageOrient } from "../store/actions/actions";

export default function (dispatch, getState, api) {
    // document settings
    api.asc_registerCallback('asc_onPageOrient', (isPortrait) => {
        dispatch(resetPageOrient(isPortrait === true));
    });
}