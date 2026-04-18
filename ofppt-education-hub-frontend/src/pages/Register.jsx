import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nom_complet: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.password_confirmation) {
      return setError("Les mots de passe ne correspondent pas.");
    }

    try {
      const user = await register(
        form.nom_complet,
        form.email,
        form.password,
        form.password_confirmation,
      );

      if (user.role === "admin") navigate("/admin");
      else if (user.role === "mentor") navigate("/mentor");
      else navigate("/etudiant");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Inscription</h2>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          {["nom_complet", "email", "password", "password_confirmation"].map(
            (field) => (
              <input
                key={field}
                style={styles.input}
                type={
                  field.includes("password")
                    ? "password"
                    : field === "email"
                      ? "email"
                      : "text"
                }
                name={field}
                placeholder={
                  field === "nom_complet"
                    ? "Nom complet"
                    : field === "email"
                      ? "Email"
                      : field === "password"
                        ? "Mot de passe"
                        : "Confirmer le mot de passe"
                }
                value={form[field]}
                onChange={handleChange}
                required
              />
            ),
          )}

          <button style={styles.button} type="submit">
            S'inscrire
          </button>
        </form>

        <p style={styles.link}>
          Déjà inscrit ? <Link to="/login">Se connecter</Link>
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
  title: {
    textAlign: "center",
    marginBottom: "1.5rem",
    color: "#333",
  },
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
  error: {
    color: "red",
    marginBottom: "1rem",
    textAlign: "center",
  },
  link: {
    textAlign: "center",
    marginTop: "1rem",
  },
};
