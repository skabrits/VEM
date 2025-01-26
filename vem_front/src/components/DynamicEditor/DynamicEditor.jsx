import React from 'react';
import './DynamicEditor.css';
import * as Common from './Common';
import * as GCommon from 'src/Common';
import { toast } from 'react-toastify';
import { localizedStrings } from 'src/Localization.js'
import { useOutletContext, useNavigate } from "react-router-dom";
import { usePromiseTracker, trackPromise } from "react-promise-tracker";
import { RotatingLines } from 'react-loader-spinner';


export function DynamicEditor(props) {
  const navigate = useNavigate();
  const context = useOutletContext();

  return (
    <>
    <h2>{localizedStrings.editor.types?.[context.type]}</h2>
    {
      <DynamicEditorHelper lastPage={context.lastPage} navigate={navigate} type={context.type} preset={context?.fields || {}} redirected={context?.fields || false} oid={context?.oid ?? null} lastOid={context?.lastOid} currentOid={context?.currentOid} memory={context?.memory ?? null} />
    }
    </>
  );
}


function LoadSubmit(props) {
  const { promiseInProgress } = usePromiseTracker({area: `${props.resource}-sbm`});
  return promiseInProgress && <div id={`lazy-bar-${props.resource}`} style={{ display: "inline", position: "absolute", width: "10%", marginTop: 40, marginLeft: "-5%" }}><RotatingLines color="#4fa94d" width={22} visible={true} /></div>
}


class DynamicEditorHelper extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      fields: {},
      form: props.preset,
      redirected: props.redirected,
      oid: props.oid,
      clickable: true
    };
    this.processData = this.processData.bind(this);
    this.processPreset = this.processPreset.bind(this);
    this.loadData = this.loadData.bind(this);
    this.updateForm = this.updateForm.bind(this);
    this.removeKey = this.removeKey.bind(this);
    this.renderInput = this.renderInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onSubmitLoad = this.onSubmitLoad.bind(this);
    this.onSubmitSuccessLoad = this.onSubmitSuccessLoad.bind(this);
  }

  onSubmitLoad(_) {
    this.setState({clickable: true});
  }

  processData(data) {
    if (((data.status / 100) | 0) === 2) {
      this.setState({
        isLoaded: true,
        fields: data.data
      });
    } else {
      console.error(data.message);
      this.setState({
        isLoaded: false,
        fields: {}
      });
    }
  }

  processPreset(data) {
    if (((data.status / 100) | 0) === 2) {
      if (this.props?.currentOid !== this.props.oid){
        this.setState({
          form: data.data
        });
      }
    } else {
      console.error(data.message)
      this.setState({
        form: {}
      });
    }
  }

  loadData() {
    if (this.state.oid !== null) {
      GCommon.Api.fetchApiResourceGet(this.props.type, this.state.oid, { callbackOnSuccessLoad: this.processPreset });
    }
    GCommon.Api.fetchApiSchema(this.props.type, { callbackOnSuccessLoad: this.processData });
  }

  updateForm(key, value) {
    if (value !== null && (this.state.form?.[key] ?? "") !== value) {
      this.setState({form: {...this.state.form, [key]: value}});
    }
  }

  removeKey(key) {
    this.setState({form: {...this.state.form, [key]: undefined}});
  }

  onSubmitSuccessLoad(data) {
    if (((data.status / 100) | 0) === 2) {
      let locationData = {state: {preset: this.props.memory, currentOid: this.props.lastOid}};
      this.props.navigate(this.props.lastPage ?? "/", locationData);
    } else {
      toast.dismiss();
      toast.error(data.message, {autoClose: 5000});
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.state.clickable) {
      this.setState({clickable: false});
      const data = this.state.form;
      if (this.state.oid !== null) {
        trackPromise(GCommon.Api.fetchApiResourceGet(this.props.type, this.state.oid, { callbackOnSuccessLoad: this.onSubmitSuccessLoad, callbackOnFailedLoad: this.onSubmitLoad, callbackOnLoad: this.onSubmitLoad }, { method: 'POST', body: JSON.stringify(data), headers: {"Content-Type": "application/json"} }), `${this.props.type}-sbm`);
      } else {
        trackPromise(GCommon.Api.fetchApiResource(this.props.type, { callbackOnSuccessLoad: this.onSubmitSuccessLoad, callbackOnFailedLoad: this.onSubmitLoad, callbackOnLoad: this.onSubmitLoad }, { method: 'PUT', body: JSON.stringify(data), headers: {"Content-Type": "application/json"} }), `${this.props.type}-sbm`);
      }
    }
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.type !== prevProps.type) {
      this.setState({
        isLoaded: false,
        fields: {},
        form: this.props.preset,
        redirected: true,
        oid: this.props.oid,
        clickable: true
      });
    }

    if (this.state.isLoaded !== true) {
      this.loadData();
    }
  }

  renderInput([key, value]) {
    const specialKey = Object.keys(Common.specialTypes).find(t_key => key.match(t_key));
    let resource =  key;
    let inputElement = Common.types[value[0]];

    if (specialKey !== undefined) {
      resource =  key.match(specialKey)[1].replace(new RegExp(".*"), Common.specialTypes[specialKey]?.[0] ?? "$&");
      inputElement = (Common.specialTypes[specialKey][1] ?? Common.specialTypes[specialKey]);
    }

    const params = {
      resource: resource,
      key: key,
      name: key,
      value: value,
      class: "form-element",
      propertySetter: this.updateForm,
      propertyUnsetter: this.removeKey,
      sharedState: this.state.form,
      memory: this.props.memory,
      redirected: this.state?.redirected,
      oidProvided: this.state.oid,
      parentType: this.props.type
    };

    return(
      <div key={`${key}-div`} className="form-element">
        <label htmlFor={key} className="form-element" key={`${key}-label`}>{localizedStrings.editor?.[key] ?? key}</label>
        {
          React.createElement(inputElement, params)
        }
      </div>
    );
  }

  render() {
    return (
      <>
      <form onSubmit={this.handleSubmit}>
        { Object.entries(this.state.fields).map(this.renderInput) }
        <button type="submit" className="form-element">{localizedStrings.save}</button><LoadSubmit resource={this.props.type} />
      </form>
      </>
    )
  }
}
