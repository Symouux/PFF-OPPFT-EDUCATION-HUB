// ET-taheri khaoula
import { useState } from "react";
import "./AuthPage.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [isActive, setIsActive] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: localStorage.getItem("rememberedEmail") || "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(
    !!localStorage.getItem("rememberedEmail"),
  );

  const [registerData, setRegisterData] = useState({
    nom_complet: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");

  const [pwStrength, setPwStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // Password strength
  const getStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[@$!%*?&]/.test(pwd)) score++;
    return score;
  };

  const strengthConfig = [
    { label: "", color: "" },
    { label: "Faible", color: "#E24B4A" },
    { label: "Moyen", color: "#EF9F27" },
    { label: "Bon", color: "#3a7bd5" },
    { label: "Fort", color: "#1D9E75" },
  ];

  // ================= LOGIN =================
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    try {
      const data = await login(loginData.email, loginData.password);

      const role = data.user?.role; // Correct path for role

      // remember me
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", loginData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // redirect par role
      if (role === "admin") navigate("/admin");
      else if (role === "mentor") navigate("/mentor");
      else navigate("/etudiant");
    } catch (err) {
      setLoginError(err.response?.data?.message || "Erreur login");
    }
  };

  // ================= REGISTER =================
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError("");

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(registerData.password)) {
      setRegisterError(
        "Min 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial",
      );
      return;
    }

    if (registerData.password !== registerData.password_confirmation) {
      setRegisterError("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      await register(
        registerData.nom_complet,
        registerData.email,
        registerData.password,
        registerData.password_confirmation,
      );

      setIsActive(false); // redirect login
    } catch (err) {
      setRegisterError(err.response?.data?.message || "Erreur register");
    }
  };

  return (
    <div className={`container ${isActive ? "active" : ""}`}>
      {/* ================= SIGN UP ================= */}
      <div className="form-container sign-up">
        <form onSubmit={handleRegister}>
          <h1>Créer un compte</h1>
          {registerError && <p className="error">{registerError}</p>}

          <input
            type="text"
            placeholder="Nom complet"
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                nom_complet: e.target.value,
              })
            }
            required
          />

          <input
            type="email"
            placeholder="Email"
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                email: e.target.value,
              })
            }
            required
          />

          {/* password */}
          <div className="pw-wrapper">
            <div className="pw-input-row">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                onChange={(e) => {
                  setRegisterData({
                    ...registerData,
                    password: e.target.value,
                  });
                  setPwStrength(getStrength(e.target.value));
                }}
              />

              <span
                className="eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁"}
              </span>
            </div>

            {/* strength */}
            <div className="strength-bar-track">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`strength-seg ${
                    i <= pwStrength ? `level-${pwStrength}` : ""
                  }`}
                />
              ))}
            </div>
            {registerData.password && (
              <span
                className="strength-label"
                style={{ color: strengthConfig[pwStrength].color }}
              >
                {strengthConfig[pwStrength].label}
              </span>
            )}
          </div>

          <input
            type="password"
            placeholder="Confirmer mot de passe"
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                password_confirmation: e.target.value,
              })
            }
            required
          />

          <button type="submit">S'inscrire</button>
        </form>
      </div>

      {/* ================= SIGN IN ================= */}
      <div className="form-container sign-in">
        <form onSubmit={handleLogin}>
          <h1>Connexion</h1>
          {loginError && <p className="error">{loginError}</p>}

          <input
            type="email"
            placeholder="Email"
            value={loginData.email}
            onChange={(e) =>
              setLoginData({
                ...loginData,
                email: e.target.value,
              })
            }
            required
          />

          <input
            type="password"
            placeholder="Mot de passe"
            onChange={(e) =>
              setLoginData({
                ...loginData,
                password: e.target.value,
              })
            }
            required
          />

          <div className="remember-me">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Se souvenir de moi
            </label>
          </div>

          <p
            className="forgot-password"
            onClick={() => navigate("/forgot-password")}
          >
            Mot de passe oublié ?
          </p>

          <button type="submit">Se connecter</button>
        </form>
      </div>

      {/* ================= TOGGLE ================= */}
      <div className="toggle-container">
        <div className="toggle">
          <div className="toggle-panel toggle-left">
            <h1>Déjà inscrit ?</h1>
            <button onClick={() => setIsActive(false)}>Se connecter</button>
          </div>

          <div className="toggle-panel toggle-right">
            <h1>Bonjour 👋</h1>
            <small>Entrez vos informations et commencez l’aventure</small>
            <button onClick={() => setIsActive(true)}>S'inscrire</button>
          </div>
        </div>
      </div>
    </div>
  );
}
