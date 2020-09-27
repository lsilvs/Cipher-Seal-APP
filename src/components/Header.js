import React from 'react';

export default ({ logoutUser }) => (
  <div className="header">
    <h1>Cipher Seal</h1>
    <div className="logout" onClick={logoutUser} aria-hidden="true"><span>logout</span></div>
  </div>
);
