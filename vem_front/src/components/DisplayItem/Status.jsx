import React from 'react';
import * as Common from './Common';
import { usePromiseTracker } from "react-promise-tracker";
import { ThreeDots } from 'react-loader-spinner';

function Status(props) {
  return (
    <img style={{width: 12, height: 12, verticalAlign: 4}} src={Common.typeProperties[props.type].status[props.status]} alt="status" />
  )
}

export function StatusElement(props) {
    const { promiseInProgress } = usePromiseTracker({area: "status"});
    if (!promiseInProgress) {
      return <Status type={props.type} status={props.status} />
    } else {
      return <ThreeDots color="#18A558" height={20} width={20} wrapperStyle={{display: "inline-block"}} wrapperClass="" />
    }
};