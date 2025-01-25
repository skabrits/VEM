import React from 'react';
import { OptionsGenerator } from './OptionsGenerator'
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';

export const types = {
  "int": (props) => {return <input type="number" disabled={props.sharedState?.__enabled__ && !props.sharedState.__enabled__.includes(props.name)} value={props.sharedState?.[props.name] ?? ""} className={props.class} key={props.name} id={props.name} name={props.name} onChange={(e) => props.propertySetter(props.name, e.target.value)} />},
  "char": (props) => {return <input type="text" disabled={props.sharedState?.__enabled__ && !props.sharedState.__enabled__.includes(props.name)} value={props.sharedState?.[props.name] ?? ""} className={props.class} key={props.name} id={props.name} name={props.name} maxLength={props.value[1] || 1024} onChange={(e) => props.propertySetter(props.name, e.target.value)} />},
  "text": (props) => {return <div className="editor-container"><Editor style={{fontFamily: '"Fira code", "Fira Mono", monospace', fontSize: 12}} highlight={code => highlight(code, languages.yaml)} disabled={props.sharedState?.__enabled__ && !props.sharedState.__enabled__.includes(props.name)} value={props.sharedState?.[props.name] ?? ""} className={`${props.class} editor-area`} key={props.name} textareaId={props.name} name={props.name} rows="20" cols="100" onValueChange={(code) => props.propertySetter(props.name, code)} /></div>},
  "bit": (props) => {return <input type="checkbox" disabled={props.sharedState?.__enabled__ && !props.sharedState.__enabled__.includes(props.name)} checked={(props.sharedState?.[props.name] ?? 0) === 1} className={props.class} id={props.name} key={props.name} name={props.name} onChange={(e) => props.propertySetter(props.name, Number(e.target.checked))} />}
};

export const specialTypes = {
  "^([a-zA-Z]*)_id$": (props) => {return React.createElement(OptionsGenerator, {updateOnGlobalKey: "image", updateOnMount: false, isID: true, ...props})},
  "^(image)$": ["$&s", (props) => {return React.createElement(OptionsGenerator, props)}],
};