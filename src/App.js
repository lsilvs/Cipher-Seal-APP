import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import * as ecc from 'tiny-secp256k1';
import Header from './components/Header';
import Users from './components/Users';
import CreateUser from './components/CreateUser';
import LoginUser from './components/LoginUser';
import { getAllUsers, createUser, loginUser } from './services/UserService';

// [TODO] protect keypairs (check if bip38 is suitable)
const setCurrentUser = ({
  firstName, lastName, publicKey, privateKey,
}) => {
  const currentUser = sessionStorage.currentUser
    ? JSON.parse(sessionStorage.currentUser)
    : {};

  if (firstName) currentUser.firstName = firstName;
  if (lastName) currentUser.lastName = lastName;
  if (publicKey) currentUser.publicKey = publicKey;
  if (privateKey) currentUser.privateKey = privateKey;

  // using sessionStorage for now to make it easier to test the app
  sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
  return JSON.parse(sessionStorage.currentUser);
};

const getCurrentUser = () => (
  sessionStorage.currentUser
    ? JSON.parse(sessionStorage.currentUser)
    : null
);

const generateMnemonic = () => bip39.generateMnemonic();

const getKeypairsFromMnemonic = async (mnemonic) => {
  const seed = await bip39.mnemonicToSeed(mnemonic);

  // [TODO] replace bip32 for a generic key derivation lib
  const root = bip32.fromSeed(seed);
  const path = "m/49'/1'/0'/0/0";
  const { publicKey, privateKey } = root.derivePath(path);

  return {
    publicKey: publicKey.toString('base64'),
    privateKey: privateKey.toString('base64'),
  };
};

const signPayload = async (payload, privateKey) => {
  const encoder = new TextEncoder();
  const encodedPayload = encoder.encode(JSON.stringify(payload));
  const sha256Payload = await crypto.subtle.digest('SHA-256', encodedPayload);
  const payloadBuffer = Buffer.from(sha256Payload);

  return ecc.sign(
    payloadBuffer,
    Buffer.from(privateKey, 'base64'),
  ).toString('base64');
};

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
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      view: getCurrentUser() ? 'showUser' : 'loginUser',
    };
  }

  loginUser = async () => {
    const { user } = this.state;

    if (!bip39.validateMnemonic(user.passphrase)) {
      throw new Error('Invalid passphrase');
    }

    const payload = {
      action: 'loginUser',
    };

    const { publicKey, privateKey } = await getKeypairsFromMnemonic(user.passphrase);

    const signature = await signPayload(payload, privateKey);

    const response = await loginUser({ publicKey, signature, payload });

    if (response.success) {
      setCurrentUser({
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        publicKey,
        privateKey,
      });
      this.setState({ view: 'showUser', user: response.user });
    }
  }

  logoutUser = async () => {
    sessionStorage.removeItem('currentUser');
    this.setState({ view: 'loginUser', user: {} });
  }

  showCreateUser = async () => {
    this.setState({ view: 'createUser' });
  }

  createUser = async () => {
    const { user } = this.state;

    const payload = {
      action: 'createUser',
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };

    const { publicKey, privateKey } = await getKeypairsFromMnemonic(user.passphrase);

    const signature = await signPayload(payload, privateKey);

    const response = await createUser({ publicKey, signature, payload });

    if (response.success) {
      setCurrentUser({
        firstName: user.firstName,
        lastName: user.lastName,
        publicKey,
        privateKey,
      });
      this.setState({ view: 'showUser' });
    }
  }

  getAllUsers = async () => {
    const { publicKey, privateKey } = getCurrentUser();
    const payload = {
      action: 'getAllUsers',
    };

    const signature = await signPayload(payload, privateKey);
    const registrations = await getAllUsers({ publicKey, signature, payload });
    await Promise.all(registrations.map(async (registration) => {
      const {
        payload: regPayload,
        publicKey: regPublicKey,
        signature: regSignature,
      } = registration;
      const { user } = regPayload;
      user.validSignature = await verifySignature(regPayload, regPublicKey, regSignature);
      return user;
    }));
  }

  onChangeForm = (e) => {
    const { user } = this.state;

    if (e.target.name === 'firstname') {
      user.passphrase = generateMnemonic();
      user.firstName = e.target.value;
    } else if (e.target.name === 'lastname') {
      user.passphrase = generateMnemonic();
      user.lastName = e.target.value;
    } else if (e.target.name === 'passphrase') {
      user.passphrase = e.target.value;
    }

    this.setState({ user });
  }

  render() {
    const { view, user } = this.state;
    return (
      <div className="App">
        <Header logoutUser={this.logoutUser} />
        <div className="container mrgnbtm">
          <div className="row">
            {view === 'loginUser' && (
              <LoginUser
                loginUser={this.loginUser}
                showCreateUser={this.showCreateUser}
                onChangeForm={this.onChangeForm}
              />
            )}
            {view === 'createUser' && (
              <CreateUser
                createUser={this.createUser}
                user={user}
                onChangeForm={this.onChangeForm}
              />
            )}
            {view === 'showUser' && (
              <Users
                users={[getCurrentUser()]}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
