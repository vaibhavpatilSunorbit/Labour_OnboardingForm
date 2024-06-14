
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import OnboardingForm from './components/OnboardingForm/OnboardingForm';
import './App.css';

function App() {

  const [openSidebarToggle, setOpenSidebarToggle] = useState(false)
  const [formStatus, setFormStatus] = useState({
    kyc: false,
    personal: false,
    bankDetails: false,
    project: false
  });

  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle)
  }

 

  const handleFormSubmit = (formType) => {
    setFormStatus((prevStatus) => ({
      ...prevStatus,
      [formType]: true
    }));
  };

  return (
    <Router>
      {/* <div className="app"> */}
      <div className='grid-container'>
        <Header OpenSidebar={OpenSidebar}/>
        {/* <div className="main-content"> */}
          <Sidebar formStatus={formStatus} openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar}/>
          <Routes>
          {/* <Route path="/onboarding" element={<OnboardingForm formType="kyc" formStatus={formStatus} onFormSubmit={handleFormSubmit} />} /> */}
            <Route path="/kyc" element={<OnboardingForm formType="kyc" onFormSubmit={handleFormSubmit} />} />
            <Route path="/personal" element={<OnboardingForm formType="personal" onFormSubmit={handleFormSubmit} />} />
            <Route path="/project" element={<OnboardingForm formType="project" onFormSubmit={handleFormSubmit} />} />
            <Route path="/bankDetails" element={<OnboardingForm formType="bankDetails" onFormSubmit={handleFormSubmit} />} />
          </Routes>
        {/* </div> */}
      </div>
    </Router>
  );
}

export default App;