import { useNavigate } from 'react-router-dom';
import './MiniGame.css';

function MiniGame() {
  const navigate = useNavigate();

  return (
    <div className="minigame-container">
      <h2 className="minigame-title">🎮 2D 排球小遊戲</h2>
      <button onClick={() => navigate('/')} className="spotify-button" style={{ marginBottom: '1rem' }}>
        返回主頁
      </button>
      
      {/* 遊戲畫面容器 */}
      <div className="game-area">
        <canvas id="game-canvas" width="800" height="450">
          Your browser does not support the HTML5 canvas tag.
        </canvas>
      </div>

      <p className="minigame-tip">⚠️ 小提示：建議使用電腦遊玩，目前支援單人鍵盤操作。</p>
    </div>
  );
}

export default MiniGame;
