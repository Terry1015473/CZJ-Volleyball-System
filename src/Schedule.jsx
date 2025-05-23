import { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { deleteDoc, doc, setDoc, getDoc, getDocs, updateDoc, collection, arrayRemove, arrayUnion, addDoc } from 'firebase/firestore';

function Schedule({ user }) {
  const [timeslots, setTimeslots] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [newPeriod, setNewPeriod] = useState('morning');
  const [status, setStatus] = useState('');
  const [nickname, setNickname] = useState('');
  const buttonRefs = useRef({});

  const fetchTimeslots = async () => {
    const snapshot = await getDocs(collection(db, 'schedules'));
    const timeslotData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTimeslots(timeslotData);
  };

  useEffect(() => {
    const fetchNickname = async () => {
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        setNickname(userSnap.data().nickname);
      }
    };
    fetchTimeslots();
    fetchNickname();
  }, [user.uid]);

  const addTimeslot = async () => {
    if (!newDate.trim()) return;
    const formattedTime = `${newDate}(${newPeriod === 'morning' ? '早上' : newPeriod === 'afternoon' ? '下午' : '晚上'})`;
    await addDoc(collection(db, 'schedules'), {
      time: formattedTime,
      createdBy: user.displayName,
      participants: []
    });
    setNewDate('');
    setNewPeriod('morning');
    fetchTimeslots();
  };

  const toggleParticipation = async (id, nickname) => {
    const docRef = doc(db, 'schedules', id);
    const slotDoc = await getDoc(docRef);
    if (!slotDoc.exists()) return;

    const participants = slotDoc.data().participants || [];
    if (participants.some(p => p.uid === user.uid)) return;

    await updateDoc(docRef, {
      participants: arrayUnion({ uid: user.uid, nickname: nickname.trim() })
    });

    fetchTimeslots();
  };

  const cancelParticipation = async (id) => {
    const docRef = doc(db, 'schedules', id);
    const slotDoc = await getDoc(docRef);
    if (!slotDoc.exists()) return;

    const participants = slotDoc.data().participants || [];
    const userParticipant = participants.find(p => p.uid === user.uid);
    if (!userParticipant) return;

    await updateDoc(docRef, {
      participants: arrayRemove(userParticipant)
    });

    fetchTimeslots();
  };

  const deleteTimeslot = async (id) => {
    await deleteDoc(doc(db, 'schedules', id));
    fetchTimeslots();
  };

  const updateNickname = async (newNickname) => {
    if (!newNickname.trim()) return;

    const userDocRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists() && userSnap.data().nickname === newNickname) return;

    await setDoc(userDocRef, { nickname: newNickname });
    setNickname(newNickname);

    const snapshot = await getDocs(collection(db, 'schedules'));

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const participants = data.participants || [];
      const userParticipantIndex = participants.findIndex(p => p.uid === user.uid);
      if (userParticipantIndex !== -1) {
        const oldUserParticipant = participants[userParticipantIndex];
        const newUserParticipant = { uid: user.uid, nickname: newNickname };
        const schedRef = doc(db, 'schedules', docSnap.id);
        await updateDoc(schedRef, {
          participants: arrayRemove(oldUserParticipant)
        });
        await updateDoc(schedRef, {
          participants: arrayUnion(newUserParticipant)
        });
      }
    }

    alert('暱稱已更新並同步所有參與紀錄');
    fetchTimeslots();
  };

  const handleMouseEnter = (id) => {
    if (!nickname?.trim()) {
      setStatus('還敢皮阿！');
      const offsetX = (Math.random() - 0.5) * 500;
      const offsetY = (Math.random() - 0.5) * 500;
      const btn = buttonRefs.current[id];
      if (btn) {
        btn.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        btn.style.transition = 'transform 0.3s ease';
      }
    } else {
      setStatus('這就對了！');
    }
  };

  return (
    <div>
      <h2 className="header">設定暱稱或試試直接送出參加資訊</h2>
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="設定你的暱稱"
          className="input-field"
        />
        <button onClick={() => updateNickname(nickname)} className="spotify-button" style={{ marginLeft: '10px' }}>
          更新暱稱
        </button>
      </div>

      <h2 className="header">🆕 新增時間區間</h2>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '1.5rem' }}>
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="input-field"
        />
        <select value={newPeriod} onChange={(e) => setNewPeriod(e.target.value)} className="input-field">
          <option value="morning">早上</option>
          <option value="afternoon">下午</option>
          <option value="evening">晚上</option>
        </select>
        <button onClick={addTimeslot} className="spotify-button">新增</button>
      </div>

      <h2 className="header">📆 可選擇的時段</h2>
      <div className="slot-table">
        {timeslots.map((slot) => (
          <div key={slot.id} className="slot-row">
            <div className="slot-label">{slot.time}</div>
            <div className="slot-names">{slot.participants.map(p => p.nickname).join('、') || '（無人參加）'}</div>
            <div className="slot-buttons">
              {!slot.participants.some(p => p.uid === user.uid) ? (
                <button
                  ref={(el) => buttonRefs.current[slot.id] = el}
                  onMouseEnter={() => handleMouseEnter(slot.id)}
                  onClick={(e) => {
                    if (!nickname.trim()) {
                      const offsetX = Math.random() * 500 - 50;
                      const offsetY = Math.random() * 500 - 50;
                      e.target.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                      e.target.style.transition = 'transform 0.3s ease';
                    } else {
                      toggleParticipation(slot.id, nickname);
                    }
                  }}
                  className="spotify-button"
                >
                  +1
                </button>
              ) : (
                <button
                  className="spotify-button"
                  onClick={() => cancelParticipation(slot.id, nickname)}
                  style={{ backgroundColor: ' #b3b3b3'}}
                >
                  -1
                </button>
              )}
              {slot.createdBy === user.displayName && (
                <button
                  onClick={() => deleteTimeslot(slot.id)}
                  className="spotify-button"
                  style={{ backgroundColor: ' #d32f2f' }}
                >
                  刪除時段
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Schedule;