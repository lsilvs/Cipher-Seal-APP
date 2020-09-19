import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import * as ecc from 'tiny-secp256k1';
import { Header } from './components/Header'
import { Users } from './components/Users'
import { DisplayBoard } from './components/DisplayBoard'
import CreateUser from './components/CreateUser'
import { getAllUsers, createUser } from './services/UserService'

class App extends Component {
  state = {
    user: {},
    users: [],
    numberOfUsers: 0
  }

  createUser = async (e) => {
    let user = this.state.user

    const mnemonic = bip39.generateMnemonic()
    const seed = await bip39.mnemonicToSeed(mnemonic)

    // [TODO] replace bip32 for a generic key derivation lib
    const root = bip32.fromSeed(seed);
    const path = "m/49'/1'/0'/0/0";
    const { privateKey, publicKey } = root.derivePath(path);

    const payload = {
      action: 'registration',
      user,
    };

    const encoder = new TextEncoder();
    const encodedPayload = encoder.encode(JSON.stringify(payload));
    const sha256Payload = await crypto.subtle.digest('SHA-256', encodedPayload);
    const payloadBuffer = Buffer.from(sha256Payload);

    const signature = ecc.sign(payloadBuffer, privateKey);

    createUser({ publicKey, signature, payload })
      .then(response => {
        console.log(response);
        this.setState({numberOfUsers: this.state.numberOfUsers + 1})
    });
  }

  getAllUsers = () => {
    getAllUsers()
      .then(users => {
        console.log(users)
        this.setState({users: users, numberOfUsers: users.length})
      });
  }

  onChangeForm = (e) => {
      let user = this.state.user
      if (e.target.name === 'firstname') {
          user.firstName = e.target.value;
      } else if (e.target.name === 'lastname') {
          user.lastName = e.target.value;
      }
      this.setState({user})
  }

  render() {
    return (
      <div className="App">
        <Header></Header>
        <div className="container mrgnbtm">
          <div className="row">
            <div className="col-md-8">
                <CreateUser 
                  user={this.state.user}
                  onChangeForm={this.onChangeForm}
                  createUser={this.createUser}
                  >
                </CreateUser>
            </div>
            <div className="col-md-4">
                <DisplayBoard
                  numberOfUsers={this.state.numberOfUsers}
                  getAllUsers={this.getAllUsers}
                >
                </DisplayBoard>
            </div>
          </div>
        </div>
        <div className="row mrgnbtm">
          <Users users={this.state.users}></Users>
        </div>
      </div>
    );
  }
}

export default App;
