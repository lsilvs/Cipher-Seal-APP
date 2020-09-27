import React from 'react';

const LoginUser = ({ onChangeForm, loginUser, showCreateUser }) => (
  <div className="container">
    <div className="row">
      <div className="col-md-12 mrgnbtm">
        <h2>Log in</h2>
        <form>
          <div className="row">
            <div className="form-group col-md-6">
              <label htmlFor="passphrase">
                Passphrase
                <input type="text" onChange={(e) => onChangeForm(e)} className="form-control" name="passphrase" id="passphrase" aria-describedby="passphraseHelp" placeholder="12 words mnemonic" />
              </label>
            </div>
          </div>
          <button type="button" onClick={showCreateUser} className="btn btn-default">Sign up</button>
          <button type="button" onClick={() => loginUser()} className="btn btn-danger">Log in</button>
        </form>
      </div>
    </div>
  </div>
);

export default LoginUser;
