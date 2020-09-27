import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import * as ecc from 'tiny-secp256k1';
import Header from './components/Header';
import Users from './components/Users';
import CreateUser from './components/CreateUser';
import LoginUser from './components/LoginUser';
import {
  getAllUsersService,
  createUserService,
  loginUserService,
} from './services/UserService';

// [TODO] protect keypairs (check if bip38 is suitable)
const setCurrentUser = ({
  username, publicKey, privateKey,
}) => {
  const currentUser = sessionStorage.currentUser
    ? JSON.parse(sessionStorage.currentUser)
    : {};

  if (username) currentUser.username = username;
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

const App = () => {
  const [user, setUser] = useState(getCurrentUser() || {});
  const [view, setView] = useState(getCurrentUser() ? 'showUser' : 'loginUser');

  const loginUser = async () => {
    if (!bip39.validateMnemonic(user.passphrase)) {
      throw new Error('Invalid passphrase');
    }

    const payload = {
      action: 'loginUser',
    };

    const { publicKey, privateKey } = await getKeypairsFromMnemonic(user.passphrase);

    const signature = await signPayload(payload, privateKey);

    const response = await loginUserService({ publicKey, signature, payload });

    if (response.success) {
      setCurrentUser({
        username: response.user.username,
        publicKey,
        privateKey,
      });
      setView('showUser');
      setUser(response.user);
    }
  };

  const logoutUser = async () => {
    sessionStorage.removeItem('currentUser');
    setView('loginUser');
    setUser({});
  };

  const showCreateUser = async () => {
    setView('createUser');
  };

  const createUser = async () => {
    const { username, passphrase } = user;

    const payload = {
      action: 'createUser',
      user: { username },
    };

    const { publicKey, privateKey } = await getKeypairsFromMnemonic(passphrase);

    const signature = await signPayload(payload, privateKey);

    const response = await createUserService({ publicKey, signature, payload });

    if (response.success) {
      setCurrentUser({
        username,
        publicKey,
        privateKey,
      });
      setView('showUser');
    }
  };

  const getAllUsers = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const { publicKey, privateKey } = getCurrentUser();
    const payload = {
      action: 'getAllUsers',
    };

    const signature = await signPayload(payload, privateKey);
    const registrations = await getAllUsersService({ publicKey, signature, payload });
    const allUsers = await Promise.all(registrations.map(async (registration) => {
      const {
        payload: regPayload,
        publicKey: regPublicKey,
        signature: regSignature,
      } = registration;
      regPayload.user.validSignature = await verifySignature(
        regPayload,
        regPublicKey,
        regSignature,
      );
      return regPayload.user;
    }));

    console.log(allUsers);
  };

  const onChangeForm = (e) => {
    const newUser = { ...user };
    if (e.target.name === 'username') {
      newUser.passphrase = generateMnemonic();
      newUser.username = e.target.value;
    } else if (e.target.name === 'passphrase') {
      newUser.passphrase = e.target.value;
    }
    setUser(newUser);
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  return (
    <div className="App">
      <Header user={user} logoutUser={logoutUser} />
      <div className="container mrgnbtm">
        <div className="row">
          {view === 'loginUser' && (
            <LoginUser
              loginUser={loginUser}
              showCreateUser={showCreateUser}
              onChangeForm={onChangeForm}
            />
          )}
          {view === 'createUser' && (
            <CreateUser
              createUser={createUser}
              user={user}
              onChangeForm={onChangeForm}
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
};

export default App;
