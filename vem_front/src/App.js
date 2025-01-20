import React from 'react';
import './App.css';
import { BrowserRouter } from "react-router-dom";
import {DisplayItem} from 'src/components/DisplayItem/DisplayItem';
import { ToastContainer } from 'react-toastify';
import * as Common from 'src/Common'

function App() {
  const envs = [{"name": "skabrits/tplink:0.1.0", "status": Common.ACTIVE}, {"name": "skabrits/chemistry:latest", "status": Common.STOPPED}, {"name": "skabrits/chemistry:laatest", "status": Common.STOPPED}, {"name": "skabrits/chemiffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffstry:latsest", "status": Common.STOPPED}, {"name": "skabrits/cdhemistry:latest", "status": Common.STOPPED}, {"name": "skabrits/cdhemisdstry:latest", "status": Common.ACTIVE}, {"name": "skabrits/cdhemistry:lateawst", "status": Common.ACTIVE}, {"name": "skabrits/cdhegremistry:latest", "status": Common.ACTIVE}, {"name": "skabrits/cdhemistrdsdsy:latest", "status": Common.ACTIVE}, {"name": "skabrits/cdhqqsemistry:latest", "status": Common.ACTIVE}]
  const pvs = [{"name": "ansys-pv", "status": Common.ACTIVE}, {"name": "comsol-pv", "status": Common.STOPPED}]
  return (
    <BrowserRouter basename={process.env.REACT_APP_BASE_PATH} >
      <div className="App">
        <ToastContainer position="top-center" autoClose="1000" pauseOnHover={false} />
        <DisplayItem type="env" items={envs} />
        <DisplayItem type="pv" items={pvs} />
      </div>
    </BrowserRouter>
  );
}

export default App;
