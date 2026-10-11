import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSound from '../hooks/useSound';
import { SOCKET_URL, AVATARS } from '../config';

export default function JoinScreen() {
  const { sessionId: urlSessionId } = useParams();
  const navigate = useNavigate();
  const { playSound } = useSound();
  const [sessionId, setSessionId] = useState(urlSessionId || '');
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // Selfie states
  const [showCamera, setShowCamera] = useState(false);
  const [selfiePhoto, setSelfiePhoto] = useState(null);
  const [showSelfiePreview, setShowSelfiePreview] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    playSound('button-tap');
    try {
      let getUserMedia = null;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        getUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      } else {
        const legacy = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        if (legacy) {
          getUserMedia = (constraints) =>
            new Promise((resolve, reject) => legacy.call(navigator, constraints, resolve, reject));
        }
      }

      if (!getUserMedia) {
        setError('📱 Kamera nie jest obsługiwana w tej przeglądarce.\nNa iPhone użyj Chrome lub Firefox – Safari nie obsługuje kamery bez HTTPS.');
        return;
      }

      const mediaStream = await getUserMedia({
        video: {
          facingMode: 'user',
          width: { min: 320, ideal: 640, max: 1280 },
          height: { min: 240, ideal: 480, max: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      setShowCamera(true);

      // Wait for video element to be available
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(e => console.error('Error playing video:', e));
        }
      }, 100);
    } catch (err) {
      console.error('Error accessing camera:', err);
      if (err.name === 'NotAllowedError') {
        setError('🚫 Dostęp do kamery zablokowany.\nW ustawieniach przeglądarki zezwól na dostęp do kamery (Safari wymaga HTTPS).');
      } else if (err.name === 'NotFoundError') {
        setError('📱 Nie znaleziono kamery w urządzeniu');
      } else if (err.name === 'NotSupportedError') {
        setError('📱 Kamera nie obsługiwana – na iPhone użyj Chrome zamiast Safari.');
      } else {
        setError('Błąd dostępu do kamery: ' + err.message);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  // Local "AI-style" avatar processing without external APIs
  const processAvatarEffects = (context, width, height) => {
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        let v = Math.min(255, data[i + c] * 1.1);
        v = v > 128 ? Math.min(255, v * 1.05) : Math.max(0, v * 0.95);
        data[i + c] = v;
      }
    }
    context.putImageData(imageData, 0, 0);

    const gradient = context.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,0.1)');
    gradient.addColorStop(0.7, 'rgba(255,255,255,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.2)');
    context.globalCompositeOperation = 'overlay';
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    context.globalCompositeOperation = 'source-over';
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    playSound('button-tap');
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = 200;
    canvas.height = 200;
    const offsetX = (video.videoWidth - size) / 2;
    const offsetY = (video.videoHeight - size) / 2;

    context.save();
    // Flip horizontally to match the mirrored preview
    context.scale(-1, 1);
    context.translate(-canvas.width, 0);
    context.drawImage(video, offsetX, offsetY, size, size, 0, 0, canvas.width, canvas.height);
    context.restore();

    processAvatarEffects(context, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setSelfiePhoto(dataUrl);
    setSelectedAvatar(dataUrl);
    setShowSelfiePreview(true);
    stopCamera();
  };

  const retakeSelfie = () => {
    setSelfiePhoto(null);
    setShowSelfiePreview(false);
    setSelectedAvatar(AVATARS[0]);
    startCamera();
  };

  const cancelSelfie = () => {
    playSound('button-tap');
    setSelfiePhoto(null);
    setShowSelfiePreview(false);
    if (selectedAvatar && !AVATARS.includes(selectedAvatar)) {
      setSelectedAvatar(AVATARS[0]);
    }
    stopCamera();
  };

  // Cleanup camera on unmount
  useEffect(() => () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
  }, [stream]);

  const pickAvatar = (avatar) => {
    playSound('button-tap');
    setSelectedAvatar(avatar);
  };

  const handleJoin = async (e) => {
    e?.preventDefault();
    playSound('button-tap');
    if (!sessionId.trim() || !playerName.trim()) {
      setError('Wprowadź kod gry i swoje imię');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      const code = sessionId.trim().toUpperCase();
      const response = await fetch(`${SOCKET_URL}/api/session/${code}`);
      if (!response.ok) {
        setError('Nie znaleziono gry o tym kodzie');
        setIsJoining(false);
        return;
      }
      const sessionData = await response.json();
      if (sessionData.status !== 'lobby') {
        setError('Gra już się rozpoczęła');
        setIsJoining(false);
        return;
      }
      navigate(`/game/${code}`, {
        state: { playerName: playerName.trim(), avatar: selectedAvatar }
      });
    } catch (err) {
      setError('Błąd połączenia z serwerem');
      setIsJoining(false);
    }
  };

  return (
    <div className="screen screen--scroll join">
      <header className="brand">
        <div className="brand__mark" aria-hidden="true">?</div>
        <h1 className="brand__title">Pytajka</h1>
        <p className="brand__tag">Quiz na żywo – grasz telefonem</p>
      </header>

      <form className="card join__form" onSubmit={handleJoin}>
        {error && <div className="alert" role="alert">{error}</div>}

        <label className="field">
          <span className="field__label">Kod gry</span>
          <input
            className="field__input field__input--code"
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={8}
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck="false"
          />
        </label>

        <label className="field">
          <span className="field__label">Twoje imię</span>
          <input
            className="field__input"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Jak Cię zwą?"
            maxLength={20}
            autoComplete="nickname"
          />
        </label>

        <div className="field">
          <span className="field__label">Awatar</span>
          <div className="avatar-grid">
            {AVATARS.map((avatar) => (
              <button
                type="button"
                key={avatar}
                className={`avatar-pick ${selectedAvatar === avatar ? 'is-selected' : ''}`}
                onClick={() => pickAvatar(avatar)}
                aria-label={`Awatar ${avatar}`}
                aria-pressed={selectedAvatar === avatar}
              >
                {avatar}
              </button>
            ))}
            {selfiePhoto && (
              <button
                type="button"
                className={`avatar-pick avatar-pick--img ${selectedAvatar === selfiePhoto ? 'is-selected' : ''}`}
                onClick={() => pickAvatar(selfiePhoto)}
                aria-label="Twoje selfie"
              >
                <img src={selfiePhoto} alt="" />
              </button>
            )}
            <button
              type="button"
              className="avatar-pick avatar-pick--selfie"
              onClick={startCamera}
              aria-label="Zrób selfie"
            >
              📸
            </button>
          </div>
        </div>

        <button className="btn btn--primary btn--block" type="submit" disabled={isJoining}>
          {isJoining ? 'Dołączam…' : 'Dołącz do gry'}
        </button>
      </form>

      {showCamera && (
        <div className="modal" role="dialog" aria-label="Zrób selfie">
          <div className="modal__box">
            <div className="modal__head">
              <h3>Zrób selfie</h3>
              <button type="button" className="icon-btn" onClick={cancelSelfie} aria-label="Zamknij">✕</button>
            </div>
            <div className="camera">
              <video ref={videoRef} autoPlay playsInline muted className="camera__video" />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
            <div className="modal__actions">
              <button type="button" className="btn btn--ghost" onClick={cancelSelfie}>Anuluj</button>
              <button type="button" className="btn btn--primary" onClick={capturePhoto}>📷 Zdjęcie</button>
            </div>
          </div>
        </div>
      )}

      {selfiePhoto && showSelfiePreview && !showCamera && (
        <div className="modal" role="dialog" aria-label="Podgląd selfie">
          <div className="modal__box">
            <div className="modal__head"><h3>Podgląd selfie</h3></div>
            <div className="selfie-preview"><img src={selfiePhoto} alt="Twoje selfie" /></div>
            <div className="modal__actions">
              <button type="button" className="btn btn--ghost" onClick={retakeSelfie}>🔄 Jeszcze raz</button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => { playSound('button-tap'); setShowSelfiePreview(false); }}
              >
                ✅ Super
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
