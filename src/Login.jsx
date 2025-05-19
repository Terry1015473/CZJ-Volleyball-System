// src/Login.jsx
import { useState } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, provider } from './firebase';

function Login() {
  const [user, setUser] = useState(null);

  const login = () => {
    signInWithPopup(auth, provider)
      .then(result => setUser(result.user))
      .catch(err => console.error(err));
  };

  const logout = () => {
    signOut(auth).then(() => setUser(null));
  };

  return (
    <div>
      {user ? (
        <>
          <p>歡迎 {user.displayName}！</p>
          <button onClick={logout}>登出</button>
        </>
      ) : (
        <button onClick={login}>使用 Google 登入</button>
      )}
    </div>
  );
}

export default Login;
