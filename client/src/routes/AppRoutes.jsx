import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { MainLayout } from '../layouts/MainLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

// Public Pages
import { Home } from '../pages/Home';
import { ExploreMap } from '../pages/ExploreMap';
import { Facilities } from '../pages/Facilities';
import { FacilityDetails } from '../pages/FacilityDetails';
import { ReportIssue } from '../pages/ReportIssue';
import { EmergencyInfo } from '../pages/EmergencyInfo';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';

// Authority / Admin Pages
import { AdminDashboard } from '../pages/AdminDashboard';
import { AdminMap } from '../pages/AdminMap';
import { FacilityManagement } from '../pages/FacilityManagement';
import { IssueManagement } from '../pages/IssueManagement';
import { SpatialAnalytics } from '../pages/SpatialAnalytics';
import { UserManagement } from '../pages/UserManagement';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pilgrim Portal Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<ExploreMap />} />
        <Route path="/facilities" element={<Facilities />} />
        <Route path="/facilities/:id" element={<FacilityDetails />} />
        <Route path="/report-issue" element={<ReportIssue />} />
        <Route path="/emergency" element={<EmergencyInfo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Authority & Volunteer Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'VOLUNTEER']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="map" element={<AdminMap />} />
        <Route path="facilities" element={<FacilityManagement />} />
        <Route path="issues" element={<IssueManagement />} />
        <Route path="analytics" element={<SpatialAnalytics />} />
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
