import { useState, useEffect } from 'react';
import OTPInput from '../components/OTPInput';

function LoginOtp({ onNavigate }) {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [resendTimer, setResendTimer] = useState(0);
  
  // Validation and Feedback States
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  // Countdown timer for OTP Resend
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleResend = () => {
    if (resendTimer > 0) return;
    
    // Simulate sending OTP
    setSuccessMsg('A new secure access code has been sent!');
    setResendTimer(30); // 30 seconds countdown
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email or Phone validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,11}$/;
    
    const trimmedInput = emailOrPhone.trim();
    if (!trimmedInput) {
      newErrors.emailOrPhone = 'Please enter your email or phone number';
    } else if (trimmedInput.includes('@')) {
      if (!emailRegex.test(trimmedInput)) {
        newErrors.emailOrPhone = 'Invalid email format';
      }
    } else {
      // Clean phone number from non-numeric characters for check
      const cleanPhone = trimmedInput.replace(/[^0-9]/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.emailOrPhone = 'Please enter a valid 10-11 digit phone number';
      }
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // OTP validation
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      newErrors.otp = 'Please enter the complete 6-digit secure access code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg('');
    
    if (validateForm()) {
      const fullOtp = otp.join('');
      setSuccessMsg(`Welcome to Elite! Access Code ${fullOtp} verified successfully.`);
      // Clear inputs or redirect in real-world application
    }
  };

  return (
    <div className="auth-card mx-auto shadow-sm p-4 d-flex flex-column justify-content-between my-auto">
      <div>
        {/* Header bar */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <button 
            type="button" 
            className="btn btn-link p-0 text-primary border-0" 
            onClick={() => alert('Navigate Back clicked')}
            aria-label="Back"
          >
            <i className="bi bi-arrow-left fs-4"></i>
          </button>
          <h1 className="h3 fw-bold text-primary m-0 letter-spacing-1 text-uppercase">HRTMS</h1>
          <div style={{ width: '24px' }}></div> {/* Balanced spacer */}
        </div>

        {/* Welcome Section */}
        <div className="text-center my-3">
          <h2 className="fw-bold text-dark-navy mb-1 fs-3">Welcome to Elite</h2>
          <p className="text-muted mb-0 small">Secure access to premium management.</p>
        </div>

        {/* Tab separator "Login" */}
        <div className="text-center position-relative my-3">
          <span className="bg-white px-3 text-secondary-custom fw-semibold position-relative z-3 fs-6">Login</span>
          <hr className="position-absolute top-50 start-0 end-0 m-0 z-1 border-light-gray" />
        </div>

        {/* Success / Error Messages */}
        {successMsg && (
          <div className="alert alert-success d-flex align-items-center py-2 px-3 mb-3" role="alert">
            <i className="bi bi-check-circle-fill me-2 fs-6"></i>
            <span className="small">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email or Phone field */}
          <div className="mb-3 text-start">
            <label className="form-label small fw-bold text-dark-navy mb-2" style={{ letterSpacing: '0.05em' }}>
              EMAIL OR PHONE NUMBER
            </label>
            <div className={`input-group input-group-custom ${errors.emailOrPhone ? 'is-invalid' : ''}`}>
              <span className="input-group-text bg-transparent text-muted">
                <i className="bi bi-person-circle"></i>
              </span>
              <input
                type="text"
                className={`form-control border-start-0 ps-1 ${errors.emailOrPhone ? 'is-invalid' : ''}`}
                placeholder="Enter details"
                value={emailOrPhone}
                onChange={(e) => {
                  setEmailOrPhone(e.target.value);
                  if (errors.emailOrPhone) setErrors({ ...errors, emailOrPhone: '' });
                }}
              />
            </div>
            {errors.emailOrPhone && (
              <div className="text-danger small mt-1">{errors.emailOrPhone}</div>
            )}
          </div>

          {/* Password field */}
          <div className="mb-3 text-start">
            <label className="form-label small fw-bold text-dark-navy mb-2" style={{ letterSpacing: '0.05em' }}>
              PASSWORD
            </label>
            <div className={`input-group input-group-custom ${errors.password ? 'is-invalid' : ''}`}>
              <span className="input-group-text bg-transparent text-muted">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-control border-start-0 border-end-0 ps-1 ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
              />
              <button
                type="button"
                className={`btn btn-outline-secondary border-start-0 bg-transparent text-muted d-flex align-items-center justify-content-center border-custom-right ${errors.password ? 'border-danger' : ''}`}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
            {errors.password && (
              <div className="text-danger small mt-1">{errors.password}</div>
            )}
          </div>

          {/* Secure Access Code (OTP) field */}
          <div className="mb-2 text-start">
            <label className="form-label small fw-bold text-dark-navy mb-2" style={{ letterSpacing: '0.05em' }}>
              SECURE ACCESS CODE (OTP)
            </label>
            
            <OTPInput 
              value={otp} 
              onChange={(newOtp) => {
                setOtp(newOtp);
                if (errors.otp) setErrors({ ...errors, otp: '' });
              }} 
            />
            
            {errors.otp && (
              <div className="text-danger small mt-1 mb-2">{errors.otp}</div>
            )}
            
            {/* Links Row */}
            <div className="d-flex justify-content-between align-items-center mt-2 px-1">
              <button
                type="button"
                className={`btn btn-link p-0 border-0 text-decoration-none small fw-semibold resend-btn ${resendTimer > 0 ? 'text-muted disabled' : 'text-primary'}`}
                onClick={handleResend}
                disabled={resendTimer > 0}
              >
                {resendTimer > 0 ? `Resend Code (${resendTimer}s)` : 'Resend Code'}
              </button>
              
              <button
                type="button"
                className="btn btn-link p-0 border-0 text-decoration-none small text-primary fw-semibold"
                onClick={() => onNavigate('register')}
              >
                Register
              </button>
            </div>
          </div>

          {/* Continue Button */}
          <div className="mt-4">
            <button
              type="submit"
              className="btn btn-primary w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 continue-btn"
            >
              Continue <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-2">
        <p className="text-muted text-center small mb-0 font-sans footer-disclaimer">
          By continuing, you agree to our{' '}
          <a href="#" className="text-decoration-underline text-secondary-custom hover-primary fw-medium">Terms</a>{' '}
          and{' '}
          <a href="#" className="text-decoration-underline text-secondary-custom hover-primary fw-medium">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

export default LoginOtp;
