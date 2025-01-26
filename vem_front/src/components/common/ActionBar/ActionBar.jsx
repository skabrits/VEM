import React from 'react';
import { PiPencil } from "react-icons/pi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { StatusElement } from './Status';
import * as Common from 'src/components/common/Common';
import * as GCommon from 'src/Common';
import './ActionBar.css';
import { trackPromise } from 'react-promise-tracker';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

function EditResource(props) {
  const navigate = useNavigate();
  return <div style={{display: "inline"}} onClick={(e) => navigate(`/editor/${props.resource}/${props.oid}`, props?.locationData ?? {})}><PiPencil className="clickable" size={20} /></div>
}

export class ActionBar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {clickable: true, includeStatus: props?.includeStatus ?? true};
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
      trackPromise(GCommon.Api.fetchApiLauncher(this.props.resource, this.props.status, { callbackOnSuccessLoad: this.processStart, callbackOnFailedLoad: this.onStartLoad, callbackOnLoad: this.onStartLoad }), `${this.props.loader_resource}`);
    }
  }

  deleteResource() {
    if (this.state.clickable) {
      this.setState({clickable: false});
      trackPromise(GCommon.Api.fetchApiResourceGet(this.props.type, this.props.resource + (this.props?.deleteType ? `?rname=${this.props.deleteType}&parent_resource=${this.props?.parentType}` : ""), { callbackOnSuccessLoad: (data) => {this.processStart(data, true); if (((data.status / 100) | 0) !== 2) { toast.dismiss(); toast.error(data.message, {autoClose: 5000}) }}, callbackOnFailedLoad: this.onStartLoad, callbackOnLoad: this.onStartLoad }, {method: 'DELETE'}), `${this.props.loader_resource}`);
    }
  }

  render() {
    return (
      <div style={{height: "auto", width: "auto"}}>
        {this.state.includeStatus && <StatusElement resource={this.props.loader_resource} type={this.props.type} status={this.props.status} ready={this.props.ready} />}
        {Common.typeProperties?.[this.props.type]?.renderControl && React.createElement(Common.typeProperties[this.props.type].control[this.props.status], {className: `launcher-button ${this.props.status}`, onClick: this.startEnv, size: 20})}
        <EditResource resource={this.props.type} oid={this.props.resource} locationData={this.props?.locationData} />
        <RiDeleteBin5Line className="clickable" size={20} onClick={this.deleteResource} />
      </div>
    )
  }
}