import React from 'react';
import './OptionsGenerator.css';
import * as GCommon from 'src/Common';
import { localizedStrings } from 'src/Localization.js'
import { usePromiseTracker, trackPromise } from "react-promise-tracker";
import { RotatingLines } from 'react-loader-spinner';
import { FaPlus } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import {ActionBar} from 'src/components/common/ActionBar/ActionBar';


function NewResource(props) {
  const navigate = useNavigate();
  const location = useLocation();
  let locationData = {
    state: {
      lastPage: location.pathname,
      memory: {
        ...props.memory,
        [props.fieldName]: props.name
      },
      preset: {
        name: props.name
      },
      lastOid: props.oid
    }
  };
  if (props.supplementary !== null) {
    const ckey = Object.keys(props.supplementary)[0]
    const cval = props.supplementary[ckey]
    locationData.state.preset[ckey]= cval
  }
  return <div className="small input-icon" onClick={(e) => navigate(`/editor/${props.resource}`, locationData)}><FaPlus size={20} /></div>
}


function ResourceActionBar(props) {
  const location = useLocation();
  const locationData = {
    state: {
      lastPage: location.pathname,
      memory: {
        ...props.redirectBlock.memory,
        [props.redirectBlock.fieldName]: props.redirectBlock.name
      },
      preset: {
        name: props.redirectBlock.name
      },
      lastOid: props.redirectBlock.oid
    }
  };
  return <div className="action-bar" onClick={(e) => { e.stopPropagation(); }}>{React.createElement(ActionBar, {...props, locationData: locationData, redirectBlock: undefined})}</div>
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
      isNew: false,
      data: props.sharedState?.[props.name] ?? "",
      redirected: this.props?.redirected,
      disabled: props.sharedState?.__enabled__ && !props.sharedState.__enabled__.includes(props.name)
    };
    this.processData = this.processData.bind(this);
    this.loadData = this.loadData.bind(this);
    this.renderGroup = this.renderGroup.bind(this);
    this.processValue = this.processValue.bind(this);
  }

  processData(data) {
    if (((data.status / 100) | 0) === 2) {
      let lb = document.getElementById(`lazy-bar-${this.props.resource}`)
      if (lb) {
        lb.style.display = "none"
      }

      if (this.props?.isID) {
        let o = Object.values(data.data)[0];
        const l = (o ? o.length : 0);
        l > 0 && this.setState({addIdResource: false, isNew: false})
      }

      this.setState({
        isLoaded: true,
        redirected: false,
        options: data.data
      });
    } else {
      console.error(data.message)
      this.setState({
        isLoaded: false,
        options: {}
      });
    }
  }

  loadData(url, setValue = false) {
    let sfunc = this.processData;
    if (setValue) {
      sfunc = (data) => {this.processData(data); this.props.propertySetter(this.props.name, this.processValue(this.state.data, data?.data));}
    }
    trackPromise(GCommon.Api.fetchApiExtra(url, { callbackOnSuccessLoad: sfunc }), `${this.props.resource}-opt`);
  }

  processValue(val, { checkNew = false } = {}, options = undefined) {
    if (this.props?.isID) {
      const o = Object.values(options ?? this.state.options)[0];
      const s = (o ? o.find(v => v.name === val) : o);
      (this.state.redirected || (s ?? (val === null || val === ""))) ? this.setState({addIdResource: checkNew ? this.state.addIdResource : false, isNew: false}) : this.setState({addIdResource: checkNew ? this.state.addIdResource : true, isNew: true});
      return s?.id ?? null
    }
    return val
  }

  componentDidMount() {
    if (this.props?.isID && this.props?.oidProvided !== null && !this.state.redirected) {
      GCommon.Api.fetchApiResourceGet(this.props.resource, this.props.sharedState?.[this.props.name] ?? this.state.data, { callbackOnSuccessLoad: (data) => this.setState({data: (((data.status / 100) | 0) === 2 ? data.data.name : "")}) });
    }

    if (this.state.disabled) {
      this.setState({
        isLoaded: true
      });
    } else if (this.props?.updateOnMount ?? true) {
      this.loadData(this.props.resource);
    } else if (this.props?.updateOnGlobalKey && (this.state.redirected || (this.props?.isID && this.props?.oidProvided != null))) {
      this.loadData(this.props.resource + `?${this.props.updateOnGlobalKey}=${this.props.sharedState?.[this.props.updateOnGlobalKey] ?? ""}`, true);
    } else {
      this.setState({
        isLoaded: true
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props?.updateOnGlobalKey) {
      if (this.props.sharedState?.[this.props.updateOnGlobalKey] !== prevProps.sharedState?.[this.props.updateOnGlobalKey] || this.state.redirected) {
        this.loadData(this.props.resource + `?${this.props.updateOnGlobalKey}=${this.props.sharedState?.[this.props.updateOnGlobalKey] ?? ""}`);
      } else if (this.state.isLoaded !== true) {
        this.loadData(this.props.resource + `?${this.props.updateOnGlobalKey}=${this.props.sharedState?.[this.props.updateOnGlobalKey] ?? ""}`);
      }
    } else if (this.state.isLoaded !== true) {
      this.loadData(this.props.resource);
    }
  }

  renderGroup([name, group]) {

    const resource = this.props.resource;

    function renderItem(opt, ind) {
      return <option value={opt.name} key={`${opt.name}-${resource}-${ind}`}>{opt.name}</option>
    }

    return <React.Fragment key={name}>{group.map(renderItem)}</React.Fragment>
  }

  render() {
    const supplementary = this.props?.updateOnGlobalKey ? {[this.props.updateOnGlobalKey]: (this.props.sharedState?.[this.props.updateOnGlobalKey] ?? null)} : null;
    const NRProps = {
      fieldName: this.props.name,
      resource: this.props.resource,
      name: this.state.data,
      memory: this.props.sharedState,
      supplementary: supplementary,
      oid: this.props?.oidProvided
    };

    const ERProps = {
      fieldName: this.props.name,
      name: this.state.data,
      memory: this.props.sharedState,
      oid: this.props?.oidProvided
    };

    const RABProps = {
      loader_resource: `${this.props.resource}-opt`,
      reloadTrigger: () => {this.setState({isLoaded: false, data: ""}); this.props.propertyUnsetter(this.props.name)},
      resource: this.props.sharedState?.[this.props.name],
      type: this.props.resource,
      includeStatus: false,
      redirectBlock: ERProps
    }

    return (
      <>
      <LoadOptions resource={this.props.resource} />
      {this.state.addIdResource && React.createElement(NewResource, NRProps)}
      <input type="text" disabled={this.state.disabled} value={this.state.data} list={`${this.props.name}-list`} className={this.props.class} key={this.props.name} id={this.props.name} name={this.props.name} maxLength={this.props.value[1] || 1024} onChange={(e) => {this.setState({data: e.target.value}); this.processValue(e.target.value, {checkNew: true})}} onFocus={(e) => this.setState({addIdResource: false})} onBlur={(e) => this.props.propertySetter(this.props.name, this.processValue(e.target.value))} />
      {(!this.state.addIdResource) && <datalist id={`${this.props.name}-list`} key={`${this.props.name}-list`} defaultValue={""}>
        <option value="" disabled>{localizedStrings.editor.selectOption}</option>
        {Object.entries(this.state.options).map(this.renderGroup)}
      </datalist>}
      {(this.props?.isID && !this.state.isNew) && React.createElement(ResourceActionBar, RABProps)}
      </>
    )
  }
}
