import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

const timeLabels = {
  morning: '☀️ 早上',
  afternoon: '🌤️ 下午',
  evening: '🌙 晚上',
};

function Overview() {
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllAvailability = async () => {
      const querySnapshot = await getDocs(collection(db, 'availability'));
      const stats = {};

      querySnapshot.forEach(docSnap => {
        const { dates, name } = docSnap.data();
        const displayName = name || docSnap.id;

        if (!dates) return;

        for (const [date, slots] of Object.entries(dates)) {
          if (!stats[date]) stats[date] = {};

          slots.forEach(slot => {
            if (!stats[date][slot]) stats[date][slot] = [];
            stats[date][slot].push(displayName);
          });
        }
      });

      setSummary(stats);
      setLoading(false);
    };

    fetchAllAvailability();
  }, []);

  if (loading) return <p>讀取中...</p>;

  // 過濾掉完全沒有人出席的日期
  const filteredDates = Object.entries(summary).filter(([_, slots]) =>
    Object.values(slots).some(arr => arr.length > 0)
  );

  return (
    <div>
      <h2>出席總覽</h2>
      {filteredDates.length === 0 ? (
        <p>目前尚無任何出席紀錄</p>
      ) : (
        filteredDates.sort().map(([date, slots]) => (
          <div key={date} style={{ marginBottom: '16px' }}>
            <strong>{date}</strong>
            <ul>
              {['morning', 'afternoon', 'evening'].map(slot => {
                const people = slots[slot] || [];
                return people.length > 0 ? (
                  <li key={slot}>
                    {timeLabels[slot]}：{people.length} 人（{people.join(', ')})
                  </li>
                ) : null;
              })}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

export default Overview;
