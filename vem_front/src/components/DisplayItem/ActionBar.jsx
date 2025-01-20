import React from 'react';
import { PiPencil } from "react-icons/pi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { StatusElement } from './Status';
import * as Common from './Common';
import * as GCommon from 'src/Common';
import './ActionBar.css';
import { trackPromise } from 'react-promise-tracker';

export class ActionBar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {clickable: true};
    this.onStartLoad = this.onStartLoad.bind(this);
    this.processStart = this.processStart.bind(this);
    this.startEnv = this.startEnv.bind(this);
  }

  onStartLoad() {
    this.setState({clickable: true});
  }

  processStart(data) {
    if (data.status === 200) {
      this.props.reloadTrigger()
    } else {
      console.error(data.message)
    }
  }

  startEnv() {
    if (Common.typeProperties[this.props.type].renderControl && this.state.clickable) {
      this.setState({clickable: false});
      trackPromise(GCommon.Api.fetchApiLauncher(this.props.resource, this.props.status, { callbackOnSuccessLoad: this.processStart, callbackOnFailedLoad: this.onStartLoad, callbackOnLoad: this.onStartLoad }), "status");
    }
  }

  deleteResource() {
    if (Common.typeProperties[this.props.type].renderControl && this.state.clickable) {
      this.setState({clickable: false});
      this.setState({clickable: false});
      trackPromise(GCommon.Api.fetchApiResourceGet(this.props.resource, this.props.status, { callbackOnSuccessLoad: this.processStart, callbackOnFailedLoad: this.onStartLoad, callbackOnLoad: this.onStartLoad }, {method: 'DELETE'}), "status");
    }
  }

  render() {
    return (
      <div style={{height: "auto", width: "auto"}}>
        <StatusElement type={this.props.type} status={this.props.status} />
        {Common.typeProperties[this.props.type].renderControl && React.createElement(Common.typeProperties[this.props.type].control[this.props.status], {className: `launcher-button ${this.props.status}`, onClick: this.startEnv, size: 20})}
        <PiPencil className="clickable" size={20} />
        <RiDeleteBin5Line className="clickable" size={20} />
      </div>
    )
  }
}