// src/views/auth/authforms/AuthRegister.tsx
import { Button, Label, Select, TextInput } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

const AuthRegister = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); // Add role state
  const [age, setAge] = useState(""); // Add phone state
  const [phone, setPhone] = useState(""); // Add phone state
  const [image_User, setImage] = useState(""); // Add image state
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (name.length < 3 || name.length > 50) {
      setError("Username must be between 3 and 50 characters.");
      return false;
    }
    if (!/^[a-zA-Z0-9_ - ' ']+$/.test(name)) {
      setError("Username must contain only alphanumeric characters, underscores, or hyphens.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return false;
    }
    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter.");
      return false;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one digit.");
      return false;
    }
    if (!/[!@#$%^&*(),.?+":{}|<>]/.test(password)) {
      setError("Password must contain at least one special character.");
      return false;
    }
    if (!role) {
      setError("Please select a role.");
      return false;
    }
    if (!/^\+?[1-9]\d{1,14}$/.test(phone)) {
      setError("Please enter a valid phone number (e.g., +1234567890).");
      return false;
    }
     if (!/^\d+$/.test(age)) {
      setError("Please enter a valid age number (e.g., 20).");
      return false;
    }
    if (!image_User) {
      setError("Please provide an image .");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/users/signup",
        {
          name: name,
          email,
          password,
          role, // Include role in the request
          age: parseInt(age),
          phone, // Add phone to the request
          image_User, // Add image to the request
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true // <- pour que le cookie JWT soit stocké
        }
      );
      
      if (response.status === 200 || response.status === 201) {
        navigate("/auth/login");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      
      if (error.response) {
        // Gestion des erreurs 422 (Unprocessable Entity)
        if (error.response.status === 422) {
          const errors = error.response.data.detail;
          if (Array.isArray(errors)) {
            // Si c'est un tableau d'erreurs de validation
            setError(errors.map(e => e.msg).join(", "));
          } else if (typeof errors === 'string') {
            setError(errors);
          } else {
            setError("Validation error. Please check your inputs.");
          }
        } else {
          setError(error.response.data.detail || "Failed to register.");
        }
      } else if (error.request) {
        setError("No response from server. Please try again.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <div className="mb-2 block">
          <Label htmlFor="name" value="Name" />
        </div>
        <TextInput
          id="name"
          type="text"
          sizing="md"
          required
          className="form-control form-rounded-xl"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <div className="mb-2 block">
          <Label htmlFor="emadd" value="Email Address" />
        </div>
        <TextInput
          id="emadd"
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
          <Label htmlFor="role" value="Role" />
        </div>
        <Select
          id="role"
          required
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="form-control form-rounded-xl"
        >
          <option value="">Select a role</option>
          <option value="client">client</option>
          <option value="admin">admin</option>
          
        </Select>
      </div>
      <div className="mb-6"></div>
      <div className="mb-6">
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
      <div className="mb-4">
        <div className="mb-2 block">
          <Label htmlFor="phone" value="Phone" />
        </div>
        <TextInput
          id="phone"
          type="tel"
          sizing="md"
          required
          className="form-control form-rounded-xl"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1234567890"
        />
      </div>
      <div className="mb-4">
        <div className="mb-2 block">
          <Label htmlFor="age" value="age" />
        </div>
        <TextInput
          id="age"
          type="number"
          sizing="md"
          required
          className="form-control form-rounded-xl"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="30"
        />
      </div>
      <div className="mb-6">
        <div className="mb-2 block">
          <Label htmlFor="image" value="Image URL" />
        </div>
        <TextInput
          id="image"
          type="text"
          sizing="md"
          required
          className="form-control form-rounded-xl"
          value={image_User}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      </div>
      
      {error && (
        <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded">
          {error}
        </div>
      )}
      <Button
        color={"primary"}
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Signing up..." : "Sign Up"}
      </Button>
    </form>
  );
};

export default AuthRegister;