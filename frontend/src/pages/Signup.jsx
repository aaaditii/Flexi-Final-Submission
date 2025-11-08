import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (email && password) {
      try {
        // Replace with actual signup API logic
        const token = "dummy_token_for_" + email;
        await login(token, email);
        navigate("/");
      } catch {
        setError("Signup failed. Please try again.");
      }
    } else {
      setError("Please fill all the fields.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.avatar} />
        <form style={styles.form} onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email ID"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button type="submit" style={styles.button}>
            SIGN UP
          </button>
          {error && <p style={styles.error}>{error}</p>}
        </form>
        <p style={styles.switchText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background:
      "linear-gradient(135deg, #2b1448 0%, #682a63 40%, #35508a 100%)",
  },
  container: {
    width: 360,
    padding: "2rem",
    borderRadius: 24,
    background: "rgba(35, 20, 72, 0.34)",
    boxShadow: "0 4px 32px 10px rgba(50, 20, 90, 0.20)",
    textAlign: "center",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.18)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  input: {
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid #ccc",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontSize: 16,
    outline: "none",
    marginBottom: "4px",
    letterSpacing: "0.02em",
  },
  button: {
    background: "linear-gradient(90deg, #4751c7 20%, #a464dd 80%)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontWeight: 600,
    fontSize: 18,
    padding: "14px 0",
    marginTop: "0.7rem",
    cursor: "pointer",
    letterSpacing: "0.08em",
    boxShadow: "0 1px 7px rgba(90,80,200,0.21)",
    transition: "background 0.25s",
  },
  error: {
    marginTop: "1rem",
    color: "#f09090",
    fontWeight: "500",
    fontSize: "0.96rem",
  },
  switchText: {
    marginTop: "1.4rem",
    fontSize: "0.97rem",
    color: "#dedcff",
    letterSpacing: "0.01em",
  },
  link: {
    color: "#bad4ef",
    textDecoration: "underline",
    cursor: "pointer",
    fontWeight: 500,
  },
};

export default Signup;
