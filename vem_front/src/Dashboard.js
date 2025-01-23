import React from 'react';
import { DisplayItem } from 'src/components/DisplayItem/DisplayItem';

function Dashboard() {
  return (
    <>
      <DisplayItem type="env" />
      <DisplayItem type="pv" />
    </>
  );
}

export default Dashboard;