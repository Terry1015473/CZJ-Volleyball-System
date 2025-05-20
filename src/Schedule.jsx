import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function Schedule({ user }) {
  const [availableDates, setAvailableDates] = useState({});
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const buttonRef = useRef(null);

  const dates = Array.from({ length: 7 }, (_, i) =>
    `2025-09-${String(i + 1).padStart(2, '0')}`
  );
  const timeSlots = ['morning', 'afternoon', 'evening'];
  const timeLabels = {
    morning: '☀️ 早上',
    afternoon: '🌤️ 下午',
    evening: '🌙 晚上',
  };

  const userDocRef = doc(db, 'availability', user.uid);

  useEffect(() => {
    const fetchData = async () => {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        setAvailableDates(docSnap.data().dates || {});
      }
    };
    fetchData();
  }, [user.uid]);

  const toggleSlot = (date, slot) => {
    const daySlots = availableDates[date] || [];
    const hasSlot = daySlots.includes(slot);
    const newSlots = hasSlot
      ? daySlots.filter(s => s !== slot)
      : [...daySlots, slot];

    setAvailableDates(prev => ({
      ...prev,
      [date]: newSlots,
    }));
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    await setDoc(userDocRef, {
      name: name.trim(),
      dates: availableDates,
    });
    alert('出席資訊已儲存！');
  };

  const handleMouseEnter = () => {
    if (!name.trim()) {
      setStatus('還敢皮阿！');
      const offsetX = (Math.random() - 0.5) * 1000;
      const offsetY = (Math.random() - 0.5) * 1000;
      const btn = buttonRef.current;
      if (btn) {
        btn.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        btn.style.transition = 'transform 0.3s ease';
      }
    }
    else{
        setStatus('這就對了！');
    }
    
  };

  const handleMouseLeave = () => {
    const btn = buttonRef.current;
    if (btn) {
      btn.style.transform = 'translate(0, 0)';
    }
  };

  return (
    <div>
      <h2>選擇你能打球的日子與時段</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {dates.map(date => (
          <div key={date}>
            <strong>{date}</strong>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
              {timeSlots.map(slot => (
                <button
                  key={slot}
                  onClick={() => toggleSlot(date, slot)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '5px',
                    backgroundColor:
                      availableDates[date]?.includes(slot) ? 'green' : '#ccc',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {timeLabels[slot]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <h2>請記得送出~</h2>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <input
          type="text"
          placeholder="請輸入你的名字或暱稱,也可以嘗試直接送出"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: '8px', marginRight: '10px', width: '400px', fontSize: '20px'}}
        />
        {status && <p style={{marginTop: '10px'}}>{status}</p>}
        <button
          ref={buttonRef}
          onMouseEnter={handleMouseEnter}
        //   onMouseLeave={handleMouseLeave}
          onClick={ (e) => {
            if (!name){
                const offsetX = Math.random() * 100 -50;
                const offsetY = Math.random() * 100 -50;
                e.target.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            } else{
              handleSubmit();
            }
          }}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            borderRadius: '6px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          送出出席資訊
        </button>
      </div>
    </div>
  );
}

export default Schedule;
