import React from 'react';
import { ContentHeader } from '@components';

export default function SettingProfile() {
  return (
    <>
      <ContentHeader title="Setting" />
      <div className="container-fluid">
        <div className="box-border p-4">
          <h4 className="mb-4"><strong>Password Change</strong></h4>
          <div className="form-group">
            <label htmlFor="newPassword">New Password:</label>
            <input
              type="password"
              className="form-control"
              id="newPassword"
              name="newPassword"
              placeholder="Enter new password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Re-enter Password:</label>
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Re-enter new password"
            />
          </div>
          <button className="btn btn-primary">Change Password</button>
        </div>
      </div>
    </>
  );
}
