
"use client";

import { useEffect, useRef, useState } from "react";

type FormData = {
  name: string;
  phone: string;
  email: string;
  instagram: string;
};

export default function Home() {
  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    instagram: "",
  });

  const [photo, setPhoto] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function startCamera() {
    setError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera access requires HTTPS or localhost.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraOn(true);
    } catch {
      setError(
        "Unable to access the camera. Allow camera permission and try again."
      );
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.videoWidth === 0) {
      setError("Camera is not ready. Please try again.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setError("Unable to capture the image.");
      return;
    }

    // Mirror the image to match the front-camera preview.
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    setPhoto(canvas.toDataURL("image/jpeg", 0.85));
    setError("");
    stopCamera();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!photo) {
      setError("Please capture your face photo first.");
      return;
    }

    // Demo only: this does not save data to a database.
    // Send the form and photo to a secure backend when ready.
    console.log({
      ...form,
      facePhoto: photo,
    });

    setMessage("Form validated successfully!");
  }

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <main className="page">
      <section className="form-card">
        <div className="header">
          <div className="logo">FR</div>
          <p className="eyebrow">FACE REGISTRATION</p>
          <h1>Create your profile</h1>
          <p className="subtitle">
            Enter your details and capture a photo to register.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="phone">Phone number</label>
            <input
              id="phone"
              type="tel"
              placeholder="+91 98765 43210"
              autoComplete="tel"
              pattern="[+]?[0-9 ()-]{8,20}"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="instagram">Instagram ID</label>
            <div className="input-prefix">
              <span>@</span>
              <input
                id="instagram"
                type="text"
                placeholder="yourusername"
                value={form.instagram}
                onChange={(e) =>
                  updateField(
                    "instagram",
                    e.target.value.replace(/^@/, "")
                  )
                }
                required
              />
            </div>
          </div>

          <div className="divider" />

          <div className="camera-heading">
            <div>
              <h2>Face photo</h2>
              <p>Position your face inside the camera frame.</p>
            </div>
            <span className="camera-icon">◎</span>
          </div>

          <div className="camera-box">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="captured-photo" src={photo} alt="Captured face" />
            ) : cameraOn ? (
              <video
                ref={videoRef}
                className="camera-video"
                autoPlay
                muted
                playsInline
              />
            ) : (
              <div className="camera-placeholder">
                <div className="face-outline">
                  <svg
                    viewBox="0 0 100 120"
                    width="76"
                    height="92"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <ellipse cx="50" cy="39" rx="25" ry="32" />
                    <path d="M12 112 C14 77 32 68 50 68 C68 68 86 77 88 112" />
                  </svg>
                </div>
                <p>Camera preview will appear here</p>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} hidden />

          <div className="camera-actions">
            {photo ? (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setPhoto(null);
                  setMessage("");
                }}
              >
                Retake photo
              </button>
            ) : cameraOn ? (
              <>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={stopCamera}
                >
                  Cancel camera
                </button>
                <button
                  type="button"
                  className="primary-button"
                  onClick={capturePhoto}
                >
                  Capture photo
                </button>
              </>
            ) : (
              <button
                type="button"
                className="primary-button full-button"
                onClick={startCamera}
              >
                Open camera
              </button>
            )}
          </div>

          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}

          <button type="submit" className="submit-button">
            Submit registration <span>→</span>
          </button>

          <p className="privacy-note">
            Your camera is activated only when you choose to open it.
            This demo does not upload or save your information.
          </p>
        </form>
      </section>
    </main>
  );
}
