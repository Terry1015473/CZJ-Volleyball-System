import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import { auth, provider } from './firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import './App.css';
import Login from './Login';
import Schedule from './Schedule'
import Overview from './Overview';

function App() {
  const [user, setUser] = useState(null);
  const [showOverview, setShowOverview] = useState(false);
  const secretcode = import.meta.env.VITE_INTERNAL_ACCESS_CODE;
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = async () => {
    if (password != secretcode){
      setPasswordError('密碼錯誤，請重新輸入!');
      return;
    }
    setPasswordError('');
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isInAppBrowser = /Line|Instagram|FBAN|FBAV/.test(navigator.userAgent);
    if (ua.includes('Line') || ua.includes('Instagram' || isInAppBrowser)) {
      alert('請使用瀏覽器打開此頁面，以正常使用登入功能');
    }
    return () => unsub();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>CZJ-Volleyball-System</h1>
      {user ? (
        <>
        <p>歡迎 {user.displayName}</p>
        <button onClick={handleLogout}>登出</button>
        <button onClick={() => setShowOverview(!showOverview)}>
          {showOverview ? '返回登記畫面' : '查看出席總覽'}
        </button>
        {showOverview ? <Overview/> : <Schedule user={user} />}
        {/* <Schedule user={user}/> */}
        </>
      ) : (
        <div>
          <input
            type="password"
            placeholder='請輸入密碼'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style = {{ marginRight: '8px'}}
          />
          <button onClick={handleLogin}>使用 Google 登入</button>
          {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
        </div>
      )}
    </div>
  );
}

export default App
