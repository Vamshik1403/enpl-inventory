"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff, User, Lock, LogIn, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) throw new Error("Invalid credentials");

      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("userId", data.userId.toString());
      localStorage.setItem("userType", data.userType);

      toast.success("Successfully logged in!");
      setTimeout(() => {
        router.push(
          ["HOD", "MANAGER", "EXECUTIVE", "SUPERADMIN"].includes(data.userType)
            ? "/dashboard"
            : "/"
        );
      }, 1000);
    } catch (error: any) {
      setErrorMessage(error.message);
      toast.error(error.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full opacity-10"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full opacity-10"
          animate={{
            scale: [1.1, 1, 1.1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-60 h-60 bg-gradient-to-br from-indigo-400 to-blue-600 rounded-full opacity-5"
          animate={{
            scale: [1, 1.2, 1],
            x: [-50, 50, -50],
            y: [-30, 30, -30],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-6 pb-8">
            {/* Logo and Company */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center justify-center space-x-3"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  <img 
                    src="/Enpl-logo.jpeg" 
                    alt="ENPL Logo" 
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ENPL India
                </h1>
                <p className="text-xs text-muted-foreground">Inventory Management</p>
              </div>
            </motion.div>

            {/* Welcome Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-center space-y-2"
            >
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Sign in to access your dashboard
              </p>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Message */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {errorMessage}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Login Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {/* Username Field */}
              <motion.div
                className="space-y-2"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Label htmlFor="username" className="text-sm font-medium text-slate-700">
                  Username
                </Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Enter your username"
                    className="pl-10 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 group-hover:border-slate-300"
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                className="space-y-2"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 group-hover:border-slate-300"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-slate-700 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </motion.button>
                </div>
              </motion.div>

              {/* Login Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? (
                    <motion.div
                      className="flex items-center space-x-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Signing in...</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="flex items-center space-x-2"
                      whileHover={{ x: 2 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Log In</span>
                    </motion.div>
                  )}
                </Button>
              </motion.div>
            </motion.form>
          </CardContent>
        </Card>
      </motion.div>

      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </div>
  );
}
