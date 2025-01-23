import React from 'react';
import { Outlet, useNavigate, useParams, useLocation } from "react-router-dom";


function Editor(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  return (
    <>
      <button style={{position: "absolute", left: "1%", top: "1%"}} onClick={()=>{ navigate(-1) }}>Back</button>
      {
        <Outlet context={{type: params.type, fields: location?.state ?? null, oid: params?.oid ?? null}} />
      }
    </>
  );
}

export default Editor;