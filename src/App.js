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

const generateMnemonic = () => bip39.generateMnemonic()

const getKeypairsFromMnemonic = async (mnemonic) => {
  const seed = await bip39.mnemonicToSeed(mnemonic)

  // [TODO] replace bip32 for a generic key derivation lib
  const root = bip32.fromSeed(seed);
  const path = "m/49'/1'/0'/0/0";
  const { publicKey, privateKey } = root.derivePath(path);
  return {
    publicKey: publicKey.toString('base64'),
    privateKey: privateKey.toString('base64')
  }
}

const signPayload = async (payload, privateKey) => {
  const encoder = new TextEncoder();
  const encodedPayload = encoder.encode(JSON.stringify(payload));
  const sha256Payload = await crypto.subtle.digest('SHA-256', encodedPayload);
  const payloadBuffer = Buffer.from(sha256Payload);

  return ecc.sign(
    payloadBuffer,
    Buffer.from(privateKey, 'base64'),
  ).toString('base64');
}

const verifySignature = async (payload, publicKey, signature) => {
  const encoder = new TextEncoder();
  const encodedPayload = encoder.encode(JSON.stringify(payload));
  const sha256Payload = await crypto.subtle.digest('SHA-256', encodedPayload);
  const payloadBuffer = Buffer.from(sha256Payload);

  return ecc.verify(
    payloadBuffer,
    Buffer.from(publicKey, 'base64'),
    Buffer.from(signature, 'base64'),
  );
}

class App extends Component {
  state = {
    user: {},
    users: [],
    numberOfUsers: 0,
  }

  createUser = async (e) => {
    let user = this.state.user

    const payload = {
      action: 'registration',
      user,
    };

    const mnemonic = generateMnemonic()
    const { publicKey, privateKey } = await getKeypairsFromMnemonic(mnemonic);

    // [TODO] protect keypairs
    // using sessionStorage for now to make it easier to test the app
    sessionStorage.setItem('currentUser', JSON.stringify({ publicKey, privateKey }))

    const signature = await signPayload(payload, privateKey);

    createUser({ publicKey, signature, payload })
      .then(response => {
        console.log(response);
        this.setState({numberOfUsers: this.state.numberOfUsers + 1})
    });
  }

  getAllUsers = async () => {
    const { publicKey, privateKey } = JSON.parse(sessionStorage.currentUser)

    const payload = {
      action: 'getAllUsers',
    };

    const signature = await signPayload(payload, privateKey);
    const registrations = await getAllUsers({ publicKey, signature, payload });
    const users = await Promise.all(registrations.map(async registration => {
      const { payload, publicKey, signature } = registration;
      const user = payload.user
      user.validSignature = await verifySignature(payload, publicKey, signature);
      return user;
    }))
    console.log(users)
    this.setState({ users, numberOfUsers: users.length })
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
