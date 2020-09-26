import React from 'react'

const CreateUser = ({ user, onChangeForm, createUser }) => {
  return(
    <div className="container">
      <div className="row">
        <div className="col-md-7 mrgnbtm">
          <h2>Create User</h2>
          <form>
            <div className="row">
              <div className="form-group col-md-6">
                <label htmlFor="exampleInputPassphrase1">First Name</label>
                <input type="text" onChange={(e) => onChangeForm(e)} className="form-control" name="firstname" id="firstname" aria-describedby="passphraseHelp" placeholder="First Name" />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="exampleInputPassword1">Last Name</label>
                <input type="text" onChange={(e) => onChangeForm(e)} className="form-control" name="lastname" id="lastname" placeholder="Last Name" />
              </div>
            </div>
            <div className="row">
              <div className="form-group col-md-12">
                <label>Passphrase (keep it safe)</label>
                <input type="text" className="form-control" name="passphrase" id="passphrase" readOnly value={user.passphrase} placeholder="12 words mnemonic" />
              </div>
            </div>
            <button type="button" onClick={() => createUser()} className="btn btn-danger">Create</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateUser
