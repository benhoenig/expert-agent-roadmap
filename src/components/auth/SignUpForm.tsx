import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { xanoService } from "@/services/xanoService";

export function SignUpForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "Mentor",
    username: "",
    nickname: "",
    full_name: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === "email") {
      setFormData(prev => ({ ...prev, username: value }));
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const xanoData = {
        username: formData.email,
        email: formData.email,
        password: formData.password,
        nickname: formData.email.split('@')[0],
        full_name: formData.email.split('@')[0],
        role: formData.role
      };
      
      console.log("Sending signup data:", xanoData);
      
      const response = await xanoService.signup(xanoData);
      console.log("Signup response:", response);
      
      // Validate that we received a proper response with an auth token
      if (!response.authToken) {
        throw new Error("Invalid response from server: Missing authentication token");
      }
      
      toast.success("Account created successfully!");
      
      if (formData.role === "Sales") {
        navigate("/sales");
      } else if (formData.role === "Mentor") {
        navigate("/mentor");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      const errorMessage = err.response?.data?.message || "Failed to create account. Please try again.";
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
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          className="w-full border-gray-200 focus-within:border-gray-300 transition-all"
          value={formData.email}
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
            autoComplete="new-password"
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
      
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Select Role
        </Label>
        <RadioGroup 
          defaultValue="Mentor" 
          className="flex space-x-2"
          value={formData.role}
          onValueChange={handleRoleChange}
        >
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="Admin" id="admin" className="border-gray-300 text-gold-500" />
            <Label htmlFor="admin" className="text-sm">Admin</Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="Mentor" id="mentor" className="border-gray-300 text-gold-500" />
            <Label htmlFor="mentor" className="text-sm">Mentor</Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="Sales" id="sales" className="border-gray-300 text-gold-500" />
            <Label htmlFor="sales" className="text-sm">Sales</Label>
          </div>
        </RadioGroup>
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
            Creating Account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
      
      <p className="text-center text-xs text-muted-foreground mt-4">
        By signing up, you agree to our Terms of Service and Privacy Policy.
      </p>
    </motion.form>
  );
}
