import React from 'react';
import { DisplayItem } from 'src/components/DisplayItem/DisplayItem';
import * as Common from 'src/Common';

function Dashboard() {
  return (
    <>
      <DisplayItem type={Common.RESOURCE_NAMES.ENVIRONMENTS} />
      <DisplayItem type={Common.RESOURCE_NAMES.PVS} />
    </>
  );
}

export default Dashboard;