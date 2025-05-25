import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

const timeLabels = {
  morning: '☀️ 早上',
  afternoon: '🌤️ 下午',
  evening: '🌙 晚上',
};

function Overview() {
  const [topTimeslots, setTopTimeslots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      const scheduleSnapshot = await getDocs(collection(db, 'schedules'));
      const stats = [];

      scheduleSnapshot.forEach(docSnap => {
        const data = docSnap.data();
        const timeString = data.time;
        const participants = data.participants || [];

        const match = timeString.match(/^(\d{4}-\d{2}-\d{2})\((早上|下午|晚上)\)$/);
        if (match) {
          const date = match[1];
          const timeLabel = match[2];
          const slot = timeLabel === '早上' ? 'morning' : timeLabel === '下午' ? 'afternoon' : 'evening';

          stats.push({
            key: `${date}_${slot}`,
            date,
            slot,
            timeLabel,
            participants: participants.map(p => p.nickname),
            participantCount: participants.length,
            createdBy: data.createdBy
          });
        }
      });

      const top3 = stats
        .sort((a, b) => b.participantCount - a.participantCount)
        .slice(0, 3);

      setTopTimeslots(top3);
      setLoading(false);
    };

    fetchOverviewData();
  }, []);

  if (loading) return <p>讀取中...</p>;

  return (
    <div>
      <h2 className="header">🔥 熱門時段 Top 3</h2>
      {topTimeslots.length === 0 ? (
        <p className="slot-item">目前沒有時段或參與者</p>
      ) : (
        <div className="slot-table">
          {topTimeslots.map(({ key, date, slot, timeLabel, participants, participantCount, createdBy }) => (
            <div key={key} className="date-block">
              <div className="date-title">{date}({timeLabel})</div>

              <div className="slot-item">
                建立者: <span className="slot-label">{createdBy}</span>
              </div>

              <div className="slot-item">
                <span className="slot-label">參與人數:</span> {participantCount} 人
              </div>

              <div className="slot-item">
                <span className="slot-label">參與者:</span> <span className="slot-names">{participants.join(', ') || '無'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Overview;
