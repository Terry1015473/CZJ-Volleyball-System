import { useState } from 'react';
import * as posedetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { useNavigate } from 'react-router-dom';


export default function AnalysisPage() {
  const [imageSrc, setImageSrc] = useState(null);
  const [resultCanvas, setResultCanvas] = useState(null);
  const navigate = useNavigate();

  const keypointIndex = {
    nose: 0, left_eye: 1, right_eye: 2, left_ear: 3, right_ear: 4,
    left_shoulder: 5, right_shoulder: 6, left_elbow: 7, right_elbow: 8,
    left_wrist: 9, right_wrist: 10, left_hip: 11, right_hip: 12,
    left_knee: 13, right_knee: 14, left_ankle: 15, right_ankle: 16,
  };

  const skeletonConnections = [
    ['left_shoulder', 'right_shoulder'],
    ['left_shoulder', 'left_elbow'],
    ['left_elbow', 'left_wrist'],
    ['right_shoulder', 'right_elbow'],
    ['right_elbow', 'right_wrist'],
    ['left_shoulder', 'left_hip'],
    ['right_shoulder', 'right_hip'],
    ['left_hip', 'right_hip'],
    ['left_hip', 'left_knee'],
    ['left_knee', 'left_ankle'],
    ['right_hip', 'right_knee'],
    ['right_knee', 'right_ankle'],
  ];

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const scale_width = (window.innerWidth * 0.5) / img.width;
        const scale_height = (window.innerHeight * 0.5) / img.height;
        const scale = (scale_height + scale_width) / 2;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        await tf.setBackend('webgl');
        await tf.ready();

        const detectorConfig = {
          modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        };
        const detector = await posedetection.createDetector(
          posedetection.SupportedModels.MoveNet,
          detectorConfig
        );

        const poses = await detector.estimatePoses(img);

        poses.forEach((pose) => {
          // 畫骨架線段
          skeletonConnections.forEach(([partA, partB]) => {
            const kpA = pose.keypoints[keypointIndex[partA]];
            const kpB = pose.keypoints[keypointIndex[partB]];
            if (kpA.score > 0.3 && kpB.score > 0.3) {
              ctx.beginPath();
              ctx.moveTo(kpA.x * scale, kpA.y * scale);
              ctx.lineTo(kpB.x * scale, kpB.y * scale);
              ctx.strokeStyle = 'cyan';
              ctx.lineWidth = 3;
              ctx.stroke();
            }
          });

          // 畫點與部位名稱
          pose.keypoints.forEach(({ x, y, score }, i) => {
            if (score > 0.3) {
              ctx.beginPath();
              ctx.arc(x * scale, y * scale, 6, 0, 2 * Math.PI);
              ctx.fillStyle = 'lime';
              ctx.fill();

            //   const name = Object.keys(keypointIndex).find(key => keypointIndex[key] === i);
            //   ctx.fillStyle = 'yellow';
            //   ctx.font = '12px Arial';
            //   ctx.fillText(name, x + 6, y - 6);
            }
          });
        });

        setImageSrc(event.target.result);
        setResultCanvas(canvas.toDataURL());
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="container">
      <h2 className="header">📷 動作姿勢分析</h2>
      <input type="file" accept="image/*" onChange={handleImageUpload} className="input-field" />
      <button onClick={() => navigate('/')} className="spotify-button" style={{ margin: '2rem' }}>
        返回主頁
      </button>
      {resultCanvas && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ color: 'var(--accent-color)' }}>分析結果</h3>
          <img src={resultCanvas} alt="Analyzed result" style={{ maxWidth: '100%' }} />
        </div>
      )}
    </div>
  );
}
