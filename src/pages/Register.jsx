import { useState } from 'react';
import { authService } from '../services/auth.service';

function Register({ onNavigate }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Validation and Feedback States
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!role) {
      newErrors.role = 'Please select a platform role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await authService.register({
          username,
          email,
          password,
          role
        });

        // Helper function to check if response status is a "good code"
        const isGoodStatus = (status) => {
          if (!status) return false;
          const s = String(status).toLowerCase();
          return s === '200' || s === '201' || s === 'success' || s === 'ok' || s === 'created';
        };

        if (isGoodStatus(response.status)) {
          setSuccessMsg(response.message || 'Account registered successfully! Welcome to RoyalTurf.');
          // Reset form fields
          setUsername('');
          setEmail('');
          setPassword('');
          setRole('');
        } else {
          setErrorMsg(response.message || 'Registration failed.');
        }
      } catch (err) {
        setErrorMsg(err.message || 'Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="register-container mx-auto d-flex flex-column justify-content-between py-2 my-auto">
      {/* Main Registration Card */}
      <div className="auth-card mx-auto shadow-sm p-4 bg-white border border-light-gray flex-grow-0 my-auto">
        <div className="text-center mt-2 mb-2">
          <h2 className="fw-bold text-dark-navy mb-1 fs-3">Join the Elite</h2>
          <p className="text-muted mb-0 small">Register for RoyalTurf Management System</p>
        </div>

        {/* Success / Error Messages */}
        {successMsg && (
          <div className="alert alert-success d-flex align-items-center py-2 px-3 my-3" role="alert">
            <i className="bi bi-check-circle-fill me-2 fs-6"></i>
            <span className="small">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="alert alert-danger d-flex align-items-center py-2 px-3 my-3" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2 fs-6"></i>
            <span className="small">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-3" noValidate>
          {/* Username Field */}
          <div className="mb-3 text-start">
            <label className="form-label small fw-semibold text-secondary-custom mb-1">Username</label>
            <div className={`input-group input-group-custom ${errors.username ? 'is-invalid' : ''}`}>
              <span className="input-group-text bg-transparent text-muted">
                <i className="bi bi-person"></i>
              </span>
              <input
                type="text"
                className={`form-control border-start-0 ps-1 ${errors.username ? 'is-invalid' : ''}`}
                placeholder="Choose a unique name"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) setErrors({ ...errors, username: '' });
                }}
              />
            </div>
            {errors.username && (
              <div className="text-danger small mt-1">{errors.username}</div>
            )}
          </div>

          {/* Email Field */}
          <div className="mb-3 text-start">
            <label className="form-label small fw-semibold text-secondary-custom mb-1">Email Address</label>
            <div className={`input-group input-group-custom ${errors.email ? 'is-invalid' : ''}`}>
              <span className="input-group-text bg-transparent text-muted">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                className={`form-control border-start-0 ps-1 ${errors.email ? 'is-invalid' : ''}`}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
              />
            </div>
            {errors.email && (
              <div className="text-danger small mt-1">{errors.email}</div>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-3 text-start">
            <label className="form-label small fw-semibold text-secondary-custom mb-1">Password</label>
            <div className={`input-group input-group-custom ${errors.password ? 'is-invalid' : ''}`}>
              <span className="input-group-text bg-transparent text-muted">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-control border-start-0 border-end-0 ps-1 ${errors.password ? 'is-invalid' : ''}`}
                placeholder="••••••••"
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

          {/* Platform Role dropdown */}
          <div className="mb-3 text-start">
            <label className="form-label small fw-semibold text-secondary-custom mb-1">Platform Role</label>
            <div className={`input-group input-group-custom ${errors.role ? 'is-invalid' : ''}`}>
              <span className="input-group-text bg-transparent text-muted">
                <i className="bi bi-person-vcard"></i>
              </span>
              <select
                className={`form-select border-start-0 ps-1 text-muted custom-select ${errors.role ? 'is-invalid' : ''}`}
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  if (errors.role) setErrors({ ...errors, role: '' });
                }}
              >
                <option value="" disabled>Select your role</option>
                <option value="SPECTATOR">Spectator</option>
                <option value="HORSE_OWNER">Horse Owner</option>
                <option value="JOCKEY">Jockey</option>
              </select>
            </div>
            {errors.role && (
              <div className="text-danger small mt-1">{errors.role}</div>
            )}
          </div>

          {/* Register Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-register w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 continue-btn"
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  REGISTERING...
                </>
              ) : (
                <>
                  REGISTER <i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Bottom Switch Link */}
        <div className="text-center mt-3">
          <p className="small mb-0 text-muted">
            Already have an account?{' '}
            <button
              type="button"
              className="btn btn-link p-0 border-0 text-decoration-none small text-primary fw-semibold"
              onClick={() => onNavigate('login')}
              style={{ display: 'inline', verticalAlign: 'baseline', lineHeight: 'inherit' }}
            >
              Login
            </button>
          </p>
        </div>
      </div>

      {/* Corporate Footer
      <div className="text-center mt-3">
        <p className="copyright-text small mb-0">
          &copy; 2024 ROYALTURF INTERNATIONAL. ALL RIGHTS RESERVED.
        </p>
      </div> */}
    </div>
  );
}

export default Register;
