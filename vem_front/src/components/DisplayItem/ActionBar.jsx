import React from 'react';
import { PiPencil } from "react-icons/pi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { StatusElement } from './Status';
import * as Common from './Common';
import * as GCommon from 'src/Common';
import './ActionBar.css';
import { trackPromise } from 'react-promise-tracker';
import { useNavigate } from "react-router-dom";

function EditResource(props) {
  const navigate = useNavigate();
  return <div style={{display: "inline"}} onClick={(e) => navigate(`/editor/${Common.typeProperties[props.resource].name}/${props.oid}`)}><PiPencil className="clickable" size={20} /></div>
}

export class ActionBar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {clickable: true};
    this.onStartLoad = this.onStartLoad.bind(this);
    this.processStart = this.processStart.bind(this);
    this.startEnv = this.startEnv.bind(this);
    this.deleteResource = this.deleteResource.bind(this);
  }

  onStartLoad() {
    this.setState({clickable: true});
  }

  processStart(data, deleted = false) {
    if (((data.status / 100) | 0) === 2) {
      this.props.reloadTrigger(deleted)
    } else {
      console.error(data.message)
    }
  }

  startEnv() {
    if (Common.typeProperties[this.props.type].renderControl && this.state.clickable) {
      this.setState({clickable: false});
      trackPromise(GCommon.Api.fetchApiLauncher(this.props.resource, this.props.status, { callbackOnSuccessLoad: this.processStart, callbackOnFailedLoad: this.onStartLoad, callbackOnLoad: this.onStartLoad }), `${this.props.loader_resource}-st`);
    }
  }

  deleteResource() {
    if (Common.typeProperties[this.props.type].renderControl && this.state.clickable) {
      this.setState({clickable: false});
      trackPromise(GCommon.Api.fetchApiResourceGet(Common.typeProperties[this.props.type].name, this.props.resource, { callbackOnSuccessLoad: (data) => this.processStart(data, true), callbackOnFailedLoad: this.onStartLoad, callbackOnLoad: this.onStartLoad }, {method: 'DELETE'}), `${this.props.loader_resource}-st`);
    }
  }

  editResource() {
    if (Common.typeProperties[this.props.type].renderControl && this.state.clickable) {
      this.setState({clickable: false});
      trackPromise(GCommon.Api.fetchApiResourceGet(Common.typeProperties[this.props.type].name, this.props.resource, { callbackOnSuccessLoad: (data) => this.processStart(data, true), callbackOnFailedLoad: this.onStartLoad, callbackOnLoad: this.onStartLoad }, {method: 'DELETE'}), `${this.props.loader_resource}-st`);
    }
  }

  render() {
    return (
      <div style={{height: "auto", width: "auto"}}>
        <StatusElement resource={this.props.loader_resource} type={this.props.type} status={this.props.status} ready={this.props.ready} />
        {Common.typeProperties[this.props.type].renderControl && React.createElement(Common.typeProperties[this.props.type].control[this.props.status], {className: `launcher-button ${this.props.status}`, onClick: this.startEnv, size: 20})}
        <EditResource resource={this.props.type} oid={this.props.resource} />
        <RiDeleteBin5Line className="clickable" size={20} onClick={this.deleteResource} />
      </div>
    )
  }
}