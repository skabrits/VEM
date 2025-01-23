import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from './Dashboard';
import Editor from './Editor';
import { DynamicEditor } from 'src/components/DynamicEditor/DynamicEditor';
import { ToastContainer } from 'react-toastify';
import { Outlet } from "react-router-dom";

function App() {
  return (
    <BrowserRouter basename={process.env.REACT_APP_BASE_PATH}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="editor/:type" element={<Editor />}>
            <Route index element={<DynamicEditor />} />
            <Route path=":oid" element={<DynamicEditor />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const Layout = () => {
  return (
    <div className="App">
      <ToastContainer position="top-center" autoClose="1000" pauseOnHover={false} />
      <Outlet />
    </div>
  )
};

export default App;
