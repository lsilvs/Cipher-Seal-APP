import React from 'react'

export const Header = ({ logoutUser }) => {
  return(
    <div className="header">
      <h1>Cipher Seal</h1>
      <div className="logout" onClick={logoutUser}><span>logout</span></div>
    </div>
  )
}
