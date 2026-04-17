import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login(email, password);
      // Redirection selon le rôle
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "mentor") navigate("/mentor");
      else navigate("/etudiant");
    } catch (err) {
      setError(err.response?.data?.message || "Identifiants incorrects.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Connexion</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button style={styles.button} type="submit">
            Se connecter
          </button>
        </form>
        <p style={styles.link}>
          Pas encore de compte ? <Link to="/register">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f0f2f5",
  },
  card: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    width: "360px",
  },
  title: { textAlign: "center", marginBottom: "1.5rem", color: "#333" },
  input: {
    display: "block",
    width: "100%",
    padding: "0.75rem",
    marginBottom: "1rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "1rem",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "0.75rem",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
  },
  error: { color: "red", marginBottom: "1rem", textAlign: "center" },
  link: { textAlign: "center", marginTop: "1rem" },
};
