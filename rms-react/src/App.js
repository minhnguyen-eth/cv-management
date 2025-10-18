import React from "react";
import { Route, Routes } from "react-router-dom";
import JobDetails from "./components/user/jobs/JobDetails";
import Main from "./components/user/Main";
import AllJobs from "./components/user/pages/AllJobs";
import ForgotPassword from "./components/user/pages/authentication/ForgotPassword";
import ChangePassword from "./components/user/pages/authentication/ChangePassword";

import Login from "./components/user/pages/authentication/Login";
import SignUp from "./components/user/pages/authentication/SignUp";
import Contact from "./components/user/pages/Contact";
import Dashboard from "./components/user/pages/Dashboard";
import ChangePasswordAuthed from "./components/user/pages/authentication/ChangePasswordAuthed";
import ProtectedRoute from "./components/ProtectedRoute";
import Candidate from "./components/dashboard/Candidate";
import Employer from "./components/dashboard/Employer";
import SysAdmin from "./components/dashboard/SysAdmin";
import CandidateProfile from "./profiles/CandidateProfileLite"; 
const App = () => {
  return (
   <Routes>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/" element={<Main />} />
  <Route path="/jobs" element={<AllJobs />} />
  <Route path="/job-details/:slug" element={<JobDetails />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/login" element={<Login />} />
  
  <Route path="/sign-up" element={<SignUp />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/change-password" element={<ChangePassword />} />
   <Route path="/account/change-password" element={<ChangePasswordAuthed />} /> {/* đổi khi đã đăng nhập */}
   <Route path="/profile" element={<CandidateProfile />} />
<Route
  path="/dashboard/candidate/*"
  element={
    <ProtectedRoute allowRoles={[0]}>
      <Candidate />
    </ProtectedRoute>
  }
/>

<Route
  path="/dashboard/employer/*"
  element={
    <ProtectedRoute allowRoles={[1]}>
      <Employer />
    </ProtectedRoute>
  }
/>

<Route
  path="/dashboard/sysadmin/*"
  element={
    <ProtectedRoute allowRoles={[2]}>
      <SysAdmin />
    </ProtectedRoute>
  }
/>
</Routes>

  );
};

export default App;
