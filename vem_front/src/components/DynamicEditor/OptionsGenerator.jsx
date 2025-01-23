import React from 'react';
import './OptionsGenerator.css';
import * as Common from './Common';
import * as GCommon from 'src/Common';
import { localizedStrings } from 'src/Localization.js'
import { usePromiseTracker, trackPromise } from "react-promise-tracker";
import { RotatingLines } from 'react-loader-spinner';
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function NewResource(props) {
  const navigate = useNavigate();
  if (props.supplementary !== null) {
    const ckey = Object.keys(props.supplementary)[0]
    const cval = props.supplementary[ckey]
    return <div className="small input-icon" onClick={(e) => navigate(`/editor/${props.resource}`, {state: {name: props.name, [ckey]: cval}})}><FaPlus size={20} /></div>
  }
  return <div className="small input-icon" onClick={(e) => navigate(`/editor/${props.resource}`, {state: {name: props.name}})}><FaPlus size={20} /></div>
}

function LoadOptions(props) {
  const { promiseInProgress } = usePromiseTracker({area: `${props.resource}-opt`, delay: 1});
  return promiseInProgress && <div id={`lazy-bar-${props.resource}`} className="big input-icon"><RotatingLines color="#4fa94d" width={22} visible={true} /></div>
}

export class OptionsGenerator extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      options: {},
      addIdResource: false,
      data: props.sharedState?.[props.name] ?? ""
    };
    this.processData = this.processData.bind(this);
    this.loadData = this.loadData.bind(this);
    this.renderGroup = this.renderGroup.bind(this);
    this.processValue = this.processValue.bind(this);
  }

  processData(data) {
    if (data.status === 200) {
      let lb = document.getElementById(`lazy-bar-${this.props.resource}`)
      if (lb) {
        lb.style.display = "none"
      }
      this.setState({
        isLoaded: true,
        options: data.data
      });

      if (this.props?.isID ?? false) {
        let o = Object.values(data.data)[0];
        const l = (o ? o.length : 0);
        l > 0 && this.setState({addIdResource: false})
      }
    } else {
      console.error(data.message)
      this.setState({
        isLoaded: false,
        options: {}
      });
    }
  }

  loadData(url) {
    trackPromise(GCommon.Api.fetchApiExtra(url, { callbackOnSuccessLoad: this.processData }), `${this.props.resource}-opt`);
  }

  processValue(val) {
    if (this.props?.isID ?? false) {
      const o = Object.values(this.state.options)[0];
      const s = (o ? o.find(v => v.name === val) : o);
      (s ?? (val === null || val === "")) ? this.setState({addIdResource: false}) : this.setState({addIdResource: true});
      return s?.id ?? null
    }
    return val
  }

  componentDidMount() {
    if (this.props?.updateOnMount ?? true) {
      this.loadData(this.props.resource);
    } else {
      this.setState({
        isLoaded: true
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.isLoaded !== true) {
      this.loadData(this.props.resource);
    } else if (this.props?.updateOnGlobalKey && this.props.sharedState?.[this.props.updateOnGlobalKey] !== prevProps.sharedState?.[this.props.updateOnGlobalKey]) {
      this.loadData(this.props.resource + `?${this.props.updateOnGlobalKey}=${this.props.sharedState?.[this.props.updateOnGlobalKey] ?? ""}`);
    }
  }

  renderGroup([name, group]) {

    const resource = this.props.resource

    function renderItem(opt, ind) {
      return <option value={opt.name} key={`${opt.name}-${resource}-${ind}`}>{opt.name}</option>
    }

    return <React.Fragment key={name}>{group.map(renderItem)}</React.Fragment>
  }

  render() {
    return (
      <>
      <LoadOptions resource={this.props.resource} />
      {this.state.addIdResource && React.createElement(NewResource, {resource: this.props.resource, name: this.state.data, supplementary: (this.props?.updateOnGlobalKey ? {[this.props.updateOnGlobalKey]: (this.props.sharedState?.[this.props.updateOnGlobalKey] ?? null)} : null)})}
      <input type="text" value={this.state.data} list={`${this.props.name}-list`} className={this.props.class} key={this.props.name} id={this.props.name} name={this.props.name} maxLength={this.props.value[1] || 1024} onChange={(e) => this.setState({data: e.target.value})} onFocus={(e) => this.setState({addIdResource: false})} onBlur={(e) => this.props.propertySetter(this.props.name, this.processValue(e.target.value))} />
      {(! this.state.addIdResource) && <datalist id={`${this.props.name}-list`} key={`${this.props.name}-list`} defaultValue={""}>
        <option value="" disabled>{localizedStrings.editor.selectOption}</option>
        {Object.entries(this.state.options).map(this.renderGroup)}
      </datalist>}
      </>
    )
  }
}
