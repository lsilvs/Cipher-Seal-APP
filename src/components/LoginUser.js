import React from 'react';

export default ({ onChangeForm, loginUser, showCreateUser }) => (
  <div className="container">
    <div className="row">
      <div className="col-md-12">
        <h2>Log in</h2>
        <form>
          <div className="row">
            <div className="form-group col-md-12">
              <label htmlFor="passphrase">
                Passphrase
                <input type="text" onChange={(e) => onChangeForm(e)} className="form-control" name="passphrase" id="passphrase" aria-describedby="passphraseHelp" placeholder="12 words mnemonic" />
              </label>
            </div>
          </div>
          <button type="button" onClick={showCreateUser} className="btn">Sign up</button>
          <button type="button" onClick={() => loginUser()} className="btn">Log in</button>
        </form>
        <p><b>Users for testing purpose</b></p>
        <div className="row">
          <div className="col-md-12">
            <span>
              <b>satoshi: </b>
              wire maple gate inherit mushroom clap task drum wave conduct mutual post
            </span>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <span>
              <b>adam3us: </b>
              pink oxygen slush accident moral box happy radar switch ring fortune comic
            </span>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <span>
              <b>NickSzabo4: </b>
              scale later panel glide dolphin pizza goose ability network move asset visit
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);
