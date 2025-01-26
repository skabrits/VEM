import React from 'react';
import './Status.css';
import * as Common from 'src/components/common/Common';
import { usePromiseTracker } from "react-promise-tracker";
import { ThreeDots } from 'react-loader-spinner';
import { localizedStrings } from 'src/Localization.js'

function Status(props) {
  return (
    <img style={{width: 12, height: 12, verticalAlign: 4}} src={Common.typeProperties[props.type].status[props.status]} alt="status" />
  )
}

export function StatusElement(props) {
    const { promiseInProgress } = usePromiseTracker({area: `${props.resource}`});
    if (!promiseInProgress && Common.typeProperties[props.type]?.ready[props.ready]) {
      return <Status type={props.type} status={props.status} />
    } else {
      return <>{!Common.typeProperties[props.type]?.ready[props.ready] && <div className="status-msg">{localizedStrings.loadingEnv}</div>}<div className="status-loader"><ThreeDots color="#18A558" height={20} width={20} wrapperStyle={{display: "inline-block"}} wrapperClass="" /></div></>
    }
};