import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import AnimatedRobot from '@/components/ui/AnimatedRobot';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const res = await fetch(`${import.meta.env.VITE_AUTH_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });
  
      const data = await res.json();
  
      if (res.ok) {
        // Save backend URL, token, tenant for future use
        localStorage.setItem("token", data.token);
        localStorage.setItem("tenant", data.tenant);
        localStorage.setItem("backend_url", data.backend_url);
        // Redirect to dashboard or home
        window.location.href = "/home";
      } else {
        alert(data.detail || "Invalid login");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed");
    }
  };
  
  
  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   console.log('Login attempt:', { email, password, rememberMe });
  //   // Redirect to home page after login
  //   window.location.href = '/home';
  // };

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Animated background elements removed */}

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="glass backdrop-blur-lg bg-white/20 border-white/30 shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                {/* <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mb-4"
                >
                  <AnimatedRobot />
                </motion.div> */}
                <h1 className="text-3xl font-bold text-black mb-2">Welcome Back!</h1>
                <p className="text-black/90">Sign in to continue your journey</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <Label htmlFor="email" className="text-black font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/80 h-5 w-5" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 bg-white/10 border-black/30 text-black placeholder:text-black/80 focus:bg-black/10 transition-all duration-300"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <Label htmlFor="password" className="text-black font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/80 h-5 w-5" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 bg-white/10 border-black/30 text-black placeholder:text-black/80 focus:bg-black/10 transition-all duration-300"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black/80 hover:text-black transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                      className="border-black/30 data-[state=checked]:bg-black data-[state=checked]:text-blue-600"
                    />
                    <Label htmlFor="remember" className="text-black/90 text-sm">
                      Remember me
                    </Label>
                  </div>
                  <a href="#" className="text-black/90 hover:text-black text-sm transition-colors">
                    Forgot Password?
                  </a>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Sign In
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-center"
                >
                  <p className="text-black/90">
                    New here?{' '}
                    <a href="#" className="text-black font-semibold hover:underline transition-all">
                      Sign Up
                    </a>
                  </p>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
