import status_green from './assets/status_green.png';
import status_red from './assets/status_red.png';
import { localizedStrings } from 'src/Localization.js';
import * as Common from 'src/Common';
import { HiOutlineStop } from "react-icons/hi2";
import { VscDebugStart } from "react-icons/vsc";

export const typeProperties = {
    "env": {
        "status": {
            [Common.ACTIVE]: status_green,
            [Common.STOPPED]: status_red
        },
        "ready": {
            [Common.READY]: true,
            [Common.UNREADY]: false
        },
        "control": {
            [Common.ACTIVE]: HiOutlineStop,
            [Common.STOPPED]: VscDebugStart
        },
        "renderControl": true,
        "header": localizedStrings.envsHeader,
        "name": process.env.REACT_APP_API_ENVIRONMENTS_NAME
    },
    "pv": {
        "status": {
            [Common.ACTIVE]: status_red,
            [Common.STOPPED]: status_green
        },
        "renderStop": false,
        "header": localizedStrings.pvsHeader,
        "name": process.env.REACT_APP_API_PVS_NAME
    }
}