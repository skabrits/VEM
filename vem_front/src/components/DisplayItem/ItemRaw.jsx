import React from 'react';
import './ItemRaw.css';
import {ActionBar} from './ActionBar';
import * as Common from './Common';
import * as GCommon from 'src/Common';
import { toast } from 'react-toastify';
import { ThreeDots } from 'react-loader-spinner';
import { usePromiseTracker, trackPromise } from "react-promise-tracker";
import { localizedStrings } from 'src/Localization.js'

function LoadingEP(props) {
    const { promiseInProgress } = usePromiseTracker({area: `${props.resource}-ld`});
    return promiseInProgress && <ThreeDots color="#18A558" height={20} width={40} wrapperStyle={{display: "inline-block"}} wrapperClass="" />
};

export class ItemRaw extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      isLoaded: true,
      clickable: true,
      status: props.status
    };
    this.processData = this.processData.bind(this);
    this.loadData = this.loadData.bind(this);
    this.reloadTrigger = this.reloadTrigger.bind(this);
    this.processEP = this.processEP.bind(this);
    this.onEPLoad = this.onEPLoad.bind(this);
    this.onEPFail = this.onEPFail.bind(this);
    this.openEnv = this.openEnv.bind(this);
  }

  processEP(data) {
    if (data.status === 200) {
      if (data.data === null) {
          toast.dismiss();
          toast.error(`${localizedStrings.errorEndpointStart} ${this.props.name} ${localizedStrings.errorEndpointEnd}`);
        } else {
          window.open(`http://${data.data}`, "_blank");
        }
    }
  }

  onEPLoad(_) {
    this.setState({clickable: true});
  }

  onEPFail(_) {
    this.setState({clickable: true});
    toast.dismiss();
    toast.error(`${localizedStrings.loadEndpointError}`);
  }

  openEnv() {
    if (this.state.status === GCommon.ACTIVE && this.state.clickable) {
        this.setState({clickable: false});
        trackPromise(GCommon.Api.fetchApiEnvEP(this.props.resource, { callbackOnSuccessLoad: this.processEP, callbackOnFailedLoad: this.onEPFail, callbackOnLoad: this.onEPLoad }), `${this.props.name.replace(" ", "-")}-ld`);
    }
  }

  reloadTrigger(deleted = false) {
    if (deleted) {
      this.props.reloadTrigger()
    } else {
      this.setState({
        isLoaded: false
      });
    }
  }

  processData(data) {
    if (data.status === 200) {
      this.setState({
        isLoaded: true,
        status: data.data.status
      });
    } else {
      console.error(data.message)
      this.setState({
        isLoaded: false,
      });
    }
  }

  loadData() {
    GCommon.Api.fetchApiResourceGet(Common.typeProperties[this.props.type].name, this.props.resource, { callbackOnSuccessLoad: this.processData });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.isLoaded !== true) {
      this.loadData();
    }
  }

  render() {
    const resource_name = this.props.name.replace(" ", "-")
    return (
      <div className="item-row" onClick={this.openEnv}>
        <div className="item-column item-name">{this.props.name}</div>
        <LoadingEP resource={resource_name} />
        <div className="item-column item-status" onClick={(e) => { e.stopPropagation(); }}><ActionBar loader_resource={resource_name} reloadTrigger={this.reloadTrigger} resource={this.props.resource} type={this.props.type} status={this.state.status} ready={this.props.ready} /></div>
      </div>
    )
  }
}
