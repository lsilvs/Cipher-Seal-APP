import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Header from './components/Header';
import Home from './components/Home';
import CreateUser from './components/CreateUser';
import LoginUser from './components/LoginUser';
import {
  createUserService,
  loginUserService,
} from './services/UserService';
import {
  generateMnemonic,
  isValidMnemonic,
  getKeypairsFromMnemonic,
  signPayload,
} from './utils/crypto';

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

const App = () => {
  const [user, setUser] = useState(getCurrentUser() || {});
  const [view, setView] = useState(getCurrentUser() ? 'showHome' : 'loginUser');

  const loginUser = async () => {
    if (!isValidMnemonic(user.passphrase)) {
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
      setView('showHome');
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
      setView('showHome');
    }
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
          {view === 'showHome' && (
            <Home currentUser={getCurrentUser()} />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
