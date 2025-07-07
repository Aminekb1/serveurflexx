import { Button, Checkbox, Label, TextInput } from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { jwtDecode } from "jwt-decode";

const AuthLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    console.log('Submitting:', { email, password });

    try {
      const response = await axios.post(
        "http://localhost:5000/users/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log('Response:', response.data);

      const token = response.data.access_token;
      if (!token || typeof token !== "string") {
        throw new Error("Token invalide ou manquant.");
      }

      const decoded: any = jwtDecode(token);
      console.log('Decoded Token:', decoded); // Debug decoded token
      localStorage.setItem('token', token);
      localStorage.setItem('userId', decoded._id); // Use decoded._id
      localStorage.setItem('email', email);

      login(token);
      console.log("Connexion réussie, redirection...");
      navigate("/", { replace: true });
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.response) {
        if (error.response.status === 401) {
          setError("Email ou mot de passe incorrect");
        } else {
          setError(error.response.data.detail || "Échec de la connexion");
        }
      } else if (error.request) {
        setError("Pas de réponse du serveur. Veuillez réessayer.");
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="email" value="Email" />
          </div>
          <TextInput
            id="email"
            type="email"
            sizing="md"
            required
            className="form-control form-rounded-xl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="userpwd" value="Password" />
          </div>
          <TextInput
            id="userpwd"
            type="password"
            sizing="md"
            required
            className="form-control form-rounded-xl"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex justify-between my-5">
          <div className="flex items-center gap-2">
            <Checkbox id="accept" className="checkbox" />
            <Label
              htmlFor="accept"
              className="opacity-90 font-normal cursor-pointer"
            >
              Remember this Device
            </Label>
          </div>
          <Link to={"/"} className="text-primary text-sm font-medium">
            Forgot Password ?
          </Link>
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <Button
          type="submit"
          color={"primary"}
          className="w-full bg-primary text-white rounded-xl"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </>
  );
};

export default AuthLogin;