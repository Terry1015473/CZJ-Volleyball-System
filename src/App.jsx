import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import { auth, provider } from './firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import './App.css';
import Login from './Login';
import Schedule from './Schedule'
import Overview from './Overview';
import LottieAnimation from './LottieAnimation';
import Footer from './Footer';

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
    <div className="container">
      <h1 className="header_title">🏐 CZJ-Volleyball-System</h1>
      {user ? (
        <>
          <p>歡迎 <strong style={{ color: 'var(--accent-color)' }}>{user.displayName}</strong></p>
          <div style={{ marginBottom: '20px' }}>
            <button onClick={handleLogout} className="spotify-button" style={{ marginRight: '10px' }}>登出</button>
            <button onClick={() => setShowOverview(!showOverview)} className="spotify-button">
              {showOverview ? '返回登記畫面' : '查看出席總覽'}
            </button>
          </div>
          <div className="card">
            {showOverview ? <Overview /> : <Schedule user={user} />}
          </div>
        </>
      ) : (
        <div>
          <LottieAnimation />
          <input
            type="password"
            placeholder="請輸入密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            style={{marginBottom: '20px'}}
          />
          <br />
          <button onClick={handleLogin} className="spotify-button">使用 Google 登入</button>
          {passwordError && <p style={{ color: 'red', marginBottom: '100px'}}>{passwordError}</p>}
          <Footer />
        </div>
      )}
      
    </div>
  );
}

export default App
