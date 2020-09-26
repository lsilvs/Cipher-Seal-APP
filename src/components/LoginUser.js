import React from 'react'

const LoginUser = ({ onChangeForm, loginUser, showCreateUser }) => {
  return(
    <div className="container">
      <div className="row">
        <div className="col-md-12 mrgnbtm">
          <h2>Log in</h2>
          <form>
            <div className="row">
              <div className="form-group col-md-6">
                <label htmlFor="exampleInputPassphrase1">Passphrase</label>
                <input type="text" onChange={(e) => onChangeForm(e)} className="form-control" name="passphrase" id="passphrase" aria-describedby="passphraseHelp" placeholder="12 words mnemonic" />
              </div>
            </div>
            <button type="button" onClick={showCreateUser} className="btn btn-default">Sign up</button>
            <button type="button" onClick={(e) => loginUser()} className="btn btn-danger">Log in</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginUser
