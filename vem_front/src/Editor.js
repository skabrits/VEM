import React from 'react';
import { Outlet, useNavigate, useParams, useLocation } from "react-router-dom";


function Editor(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  return (
    <>
      <button style={{position: "absolute", left: "1%", top: "1%"}} onClick={()=>{navigate(location?.state?.lastPage ?? "/", {state: {preset: location?.state?.memory ?? null, currentOid: location?.state?.lastOid}})}}>Back</button>
      {
        <Outlet context={{type: params.type, lastPage: location?.state?.lastPage, fields: location?.state?.preset ?? null, oid: params?.oid ?? null, lastOid: location?.state?.lastOid, currentOid: location?.state?.currentOid, memory: location?.state?.memory ?? null}} />
      }
    </>
  );
}

export default Editor;