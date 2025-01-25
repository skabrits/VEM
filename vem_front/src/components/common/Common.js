import status_green from './assets/status_green.png';
import status_red from './assets/status_red.png';
import { localizedStrings } from 'src/Localization.js';
import * as Common from 'src/Common';
import { HiOutlineStop } from "react-icons/hi2";
import { VscDebugStart } from "react-icons/vsc";

export const typeProperties = {
    [Common.RESOURCE_NAMES.ENVIRONMENTS]: {
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
        "header": localizedStrings.envsHeader
    },
    [Common.RESOURCE_NAMES.PVS]: {
        "status": {
            [Common.ACTIVE]: status_red,
            [Common.STOPPED]: status_green
        },
        "renderStop": false,
        "header": localizedStrings.pvsHeader
    }
}