import { useContext, createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const navigate = useNavigate();

  const loginAction = async (data) => {
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.message || "Login failed");
      }

      if (res.token) {
        setToken(res.token);
        localStorage.setItem("token", res.token);

        // Decode token to get user info
        const userData = res.user || JSON.parse(atob(res.token.split(".")[1]));
        setUser({
          email: userData.email,
          role: userData.role,
          nom: userData.nom,
          prenom: userData.prenom,
          cin: userData.cin,
          telephone: userData.telephone,
        });

        // 🔁 Redirect to /welcome only
        navigate("/welcome");
      } else {
        throw new Error("No token received");
      }
    } catch (err) {
      throw err;
    }
  };

  const logOut = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ token, user, loginAction, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};
