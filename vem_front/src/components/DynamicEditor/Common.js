import React from 'react';
import * as Common from 'src/Common'
import { OptionsGenerator } from './OptionsGenerator'

export const RESOURCE_NAMES = {
  IMAGES: "images",
  SETTINGS: process.env.REACT_APP_API_SETTINGS_NAME,
  ENVIRONMENTS: process.env.REACT_APP_API_ENVIRONMENTS_NAME
}

export const types = {
  "int": (props) => {return <input type="number" value={props.sharedState?.[props.name] ?? ""} className={props.class} key={props.name} id={props.name} name={props.name} onChange={(e) => props.propertySetter(props.name, e.target.value)} />},
  "char": (props) => {return <input type="text" value={props.sharedState?.[props.name] ?? ""} className={props.class} key={props.name} id={props.name} name={props.name} maxLength={props.value[1] || 1024} onChange={(event) => props.propertySetter(props.name, event.target.value)} />},
  "text": (props) => {return <textarea value={props.sharedState?.[props.name] ?? ""} className={props.class} key={props.name} id={props.name} name={props.name} rows="20" cols="100" onChange={(e) => props.propertySetter(props.name, e.target.value)} />},
  "bit": (props) => {return <input type="checkbox" checked={(props.sharedState?.[props.name] ?? 0) == 1} className={props.class} id={props.name} key={props.name} name={props.name} onChange={(e) => props.propertySetter(props.name, Number(e.target.checked))} />}
}

export const specialTypes = {
  "^([a-zA-Z]*)_id$": (props) => {return React.createElement(OptionsGenerator, {updateOnGlobalKey: "image", updateOnMount: false, isID: true, ...props})},
  "^(image)$": ["$&s", (props) => {return React.createElement(OptionsGenerator, {resource: "images", ...props})}],
}