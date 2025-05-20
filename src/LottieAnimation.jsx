import { Player } from '@lottiefiles/react-lottie-player';
import animationData from './lottie/volleyball.json';

const LottieAnimation = () => {
  return (
    <Player
      autoplay
      loop
      src={animationData}
      style={{
        position: 'fixed', // 固定在螢幕上
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1, // 放到最下層
        opacity: 0.3, // 半透明，不干擾畫面
        pointerEvents: 'none' // 確保點擊事件不會被擋住
      }}
    />
  );
};

export default LottieAnimation;
