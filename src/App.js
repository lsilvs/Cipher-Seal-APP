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
import LoginUser from './components/LoginUser'
import { getAllUsers, createUser, loginUser } from './services/UserService'

const generateMnemonic = () => bip39.generateMnemonic()

const getKeypairsFromMnemonic = async (mnemonic) => {
  const seed = await bip39.mnemonicToSeed(mnemonic)

  // [TODO] replace bip32 for a generic key derivation lib
  const root = bip32.fromSeed(seed);
  const path = "m/49'/1'/0'/0/0";
  const keypairs = root.derivePath(path);

  const publicKey = keypairs.publicKey.toString('base64')
  const privateKey = keypairs.privateKey.toString('base64')

  // [TODO] protect keypairs
  // using sessionStorage for now to make it easier to test the app
  sessionStorage.setItem('currentUser', JSON.stringify({ publicKey, privateKey }))

  return { publicKey, privateKey }
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
    view: 'loginUser',
  }

  loginUser = async (e) => {
    let user = this.state.user

    const payload = {
      action: 'loginUser',
    };

    const { publicKey, privateKey } = await getKeypairsFromMnemonic(user.passphrase);
    const signature = await signPayload(payload, privateKey);

    const response = await loginUser({ publicKey, signature, payload })
    console.log(response);
    if (response.success) {
      this.setState({ view: 'showUser', user: response.user })
    }
  }

  showCreateUser = async () => {
    this.setState({ view: 'createUser' })
  }

  createUser = async () => {
    let user = this.state.user

    const payload = {
      action: 'createUser',
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
       },
    };

    const { publicKey, privateKey } = await getKeypairsFromMnemonic(user.passphrase);
    const signature = await signPayload(payload, privateKey);

    const response = await createUser({ publicKey, signature, payload })
    console.log(response);
    if (response.success) {
      this.setState({ view: 'showUser' })
    }
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
        user.passphrase = generateMnemonic()
        user.firstName = e.target.value;
      } else if (e.target.name === 'lastname') {
        user.passphrase = generateMnemonic()
        user.lastName = e.target.value;
      } else if (e.target.name === 'passphrase') {
        user.passphrase = e.target.value;
      }

      this.setState({user})
  }

  render() {
    return (
      <div className="App">
        <Header></Header>
        <div className="container mrgnbtm">
          <div className="row">
            {this.state.view === 'loginUser' && (
              <LoginUser
                loginUser={this.loginUser}
                showCreateUser={this.showCreateUser}
                onChangeForm={this.onChangeForm}
              />
            )}
            {this.state.view === 'createUser' && (
              <CreateUser
                createUser={this.createUser}
                user={this.state.user}
                onChangeForm={this.onChangeForm}
              />
            )}
            {this.state.view === 'showUser' && (
              <Users
                users={[this.state.user]}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
