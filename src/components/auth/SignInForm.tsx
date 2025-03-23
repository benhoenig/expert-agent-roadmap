import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { xanoService } from "@/services/xanoService";

export function SignInForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // For login, we use the username field
      const credentials = {
        username: formData.username,
        password: formData.password,
      };
      
      const response = await xanoService.login(credentials);
      
      // Validate that we received a proper response with an auth token
      if (!response.authToken) {
        throw new Error("Invalid response from server: Missing authentication token");
      }
      
      // If "Remember Me" is checked, store in localStorage, otherwise in sessionStorage
      if (rememberMe) {
        localStorage.setItem("xano_token", response.authToken);
      } else {
        // Use sessionStorage which is cleared when the browser session ends
        sessionStorage.setItem("xano_token", response.authToken);
        // Remove from localStorage if it exists there
        localStorage.removeItem("xano_token");
      }
      
      toast.success("Signed in successfully!");
      
      // Get user data to determine role
      try {
        // Attempt to get user data
        const userData = await xanoService.getUserData();
        console.log("User data after login:", userData);
        
        // Navigate based on user role
        if (userData.role === "Sales") {
          navigate("/sales");
        } else if (userData.role === "Mentor") {
          navigate("/mentor");
        } else {
          // Default to dashboard (admin)
          navigate("/dashboard");
        }
      } catch (userDataErr) {
        console.error("Failed to get user data:", userDataErr);
        // If we can't get user data, default to dashboard
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.message || "Failed to sign in. Please check your credentials.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <motion.form 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm font-medium">
          Username
        </Label>
        <Input
          id="username"
          name="username"
          type="text"
          placeholder="Enter your username"
          autoComplete="username"
          required
          className="w-full border-gray-200 focus-within:border-gray-300 transition-all"
          value={formData.username}
          onChange={handleChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            className="w-full border-gray-200 focus-within:border-gray-300 transition-all pr-10"
            value={formData.password}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="remember-me" 
          checked={rememberMe} 
          onCheckedChange={(checked) => setRememberMe(checked === true)}
        />
        <Label htmlFor="remember-me" className="text-sm text-muted-foreground cursor-pointer">
          Keep me signed in
        </Label>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}
      
      <Button
        type="submit"
        className="w-full bg-gold-500 hover:bg-gold-600 text-white font-medium"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin mr-2" />
            Signing In...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </motion.form>
  );
} 