// src/components/LoginForm.tsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { AlertCircle } from 'lucide-react';
import { login } from '../redux/Slice'; // Import the login action
import { useNavigate } from 'react-router-dom';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Access the authentication state
  const { isAuthenticated, error, loading } = useSelector((state: any) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/"); // Redirect if already authenticated
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null; // Ab yahan return null karoge render ke level par
  }
  // If the user is already authenticated, redirect them

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    dispatch({ type: 'auth/loginRequest' }); // You can create a loginRequest action if needed

    // Simulate a login (replace with real login logic)
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (email === 'admin' && password === 'admin') {
      // Dispatch login action with user info on successful login
      dispatch(login({ name: 'Admin', email: 'admin@example.com' }));
    } else {
      // Dispatch failure action or set an error
      dispatch({ type: 'auth/loginFailure', payload: 'Invalid email or password' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>

          <div className='w-full flex justify-center items-center'>
            <img src="/logo.png" className='items-center' alt="error" />
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
            {error && (
              <div className="flex items-center space-x-2 text-red-500">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
