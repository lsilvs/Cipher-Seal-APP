import React from 'react';

export default ({ user, onChangeForm, createUser }) => (
  <div className="container">
    <div className="row">
      <div className="col-md-7 mrgnbtm">
        <h2>Create User</h2>
        <form>
          <div className="row">
            <div className="form-group col-md-6">
              <label htmlFor="firstname">
                First Name
                <input type="text" onChange={(e) => onChangeForm(e)} className="form-control" name="firstname" id="firstname" placeholder="First Name" />
              </label>
            </div>
            <div className="form-group col-md-6">
              <label htmlFor="lastname">
                Last Name
                <input type="text" onChange={(e) => onChangeForm(e)} className="form-control" name="lastname" id="lastname" placeholder="Last Name" />
              </label>
            </div>
          </div>
          <div className="row">
            <div className="form-group col-md-12">
              <label htmlFor="passphrase">
                Passphrase (keep it safe)
                <input type="text" className="form-control" name="passphrase" id="passphrase" readOnly value={user.passphrase} placeholder="12 words mnemonic" />
              </label>
            </div>
          </div>
          <button type="button" onClick={() => createUser()} className="btn btn-danger">Create</button>
        </form>
      </div>
    </div>
  </div>
);
