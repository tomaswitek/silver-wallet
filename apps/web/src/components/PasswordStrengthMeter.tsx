import React from "react";

interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
}) => {
  const calculateStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;
    return strength;
  };

  const strength = calculateStrength(password);
  const getColor = () => {
    switch (strength) {
      case 0:
      case 1:
        return "red";
      case 2:
      case 3:
        return "orange";
      case 4:
      case 5:
        return "green";
      default:
        return "gray";
    }
  };

  return (
    <div>
      <div
        style={{ width: "100%", backgroundColor: "lightgray", height: "5px" }}
      >
        <div
          style={{
            width: `${(strength / 5) * 100}%`,
            backgroundColor: getColor(),
            height: "100%",
            transition: "width 0.3s ease-in-out",
          }}
        />
      </div>
      <p>
        Password strength:{" "}
        {
          ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"][
            strength
          ]
        }
      </p>
    </div>
  );
};

export default PasswordStrengthMeter;
