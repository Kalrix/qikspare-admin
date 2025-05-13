import React, { useState } from "react";
import { useLogin } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import "../../styles/login.css";
import { API_BASE_URL, axiosInstance } from "../../config"; // ✅ Axios instance with auth

const quotes = [
  "Speed is everything. Quality is the key.",
  "Every problem is a gear waiting to be turned.",
  "Start your day like a fresh engine — roaring.",
  "Fix faster, serve smarter.",
  "Behind every spare part is a resolved breakdown.",
  "The road to success is paved with precision.",
  "You don't deliver parts, you deliver solutions.",
];

const LoginPage: React.FC = () => {
  const { mutate: login } = useLogin();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const quote = quotes[new Date().getDay()];

  const requestOtp = async () => {
    if (!/^\d{10}$/.test(phone)) {
      return message.error("Enter a valid 10-digit phone number");
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/api/auth/request-otp", { phone });
      setStep(2);
      message.success("OTP sent!");
    } catch (err: any) {
      message.error(err?.response?.data?.detail || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      return message.error("Enter a valid 6-digit OTP");
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/api/auth/verify-otp", {
        phone,
        otp,
        role: "admin",
      });

      const token = res.data.token || res.data.access_token;
      if (token) {
        localStorage.setItem("token", token);
        login({ token });
        message.success("Login successful!");
        navigate("/dashboard");
      } else {
        message.error("Invalid response from server");
      }
    } catch (err: any) {
      message.error(err?.response?.data?.detail || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Panel */}
      <div className="left-panel">
        <div className="login-card">
          <h2>Welcome back 👋</h2>
          <p>Login to your QikSpare Admin Panel</p>

          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            type="text"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {step === 2 && (
            <>
              <label htmlFor="otp">Enter OTP</label>
              <input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </>
          )}

          <button onClick={step === 1 ? requestOtp : verifyOtp} disabled={loading}>
            {loading
              ? step === 1
                ? "Sending..."
                : "Verifying..."
              : step === 1
              ? "Send OTP"
              : "Login"}
          </button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        <div className="branding-content glass-card">
          <img src="/qikspare-logo.png" alt="QikSpare" className="branding-logo" />
          <h2 className="branding-title">QikSpare</h2>
          <p className="tagline">30 Min Spare Parts Delivery</p>
          <p className="quote">"{quote}"</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
