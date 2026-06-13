import { useRef, useEffect } from 'react';

function OTPInput({ value, onChange }) {
  const inputRefs = useRef([]);

  // Ensure refs list has exactly 6 items
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  const handleChange = (e, index) => {
    const val = e.target.value;
    // Keep only the last character entered
    const char = val.substring(val.length - 1);
    
    const newOtp = [...value];
    newOtp[index] = char;
    onChange(newOtp);

    // Focus next input if a character was entered and we're not at the last input
    if (char !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (value[index] === '' && index > 0) {
        // Current field is empty, clear previous field and focus it
        const newOtp = [...value];
        newOtp[index - 1] = '';
        onChange(newOtp);
        inputRefs.current[index - 1].focus();
      } else {
        // Clear current field
        const newOtp = [...value];
        newOtp[index] = '';
        onChange(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Only accept numeric or alphanumeric depending on general OTP standards.
    // Let's filter out non-alphanumeric and take first 6 characters
    const cleanData = pastedData.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6);
    
    if (cleanData.length > 0) {
      const newOtp = [...value];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = cleanData[i] || '';
      }
      onChange(newOtp);

      // Focus on either the last filled input or the 6th input
      const focusIndex = Math.min(cleanData.length, 5);
      inputRefs.current[focusIndex].focus();
    }
  };

  return (
    <div className="otp-container d-flex justify-content-between my-3">
      {Array(6).fill('').map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={index === 0 ? handlePaste : undefined} // paste is captured on the first box or any
          className="form-control otp-box text-center fs-4 fw-bold"
          autoComplete="one-time-code"
          inputMode="numeric"
        />
      ))}
    </div>
  );
}

export default OTPInput;
