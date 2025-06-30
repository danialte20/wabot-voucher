import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wifi, Shield, Users, CreditCard } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Dashboard from '@/components/Dashboard';

interface User {
  id: number;
  username: string;
  whatsapp_number: string;
  role: 'admin' | 'reseller' | 'customer';
  balance: number;
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ 
    username: '', 
    password: '', 
    whatsapp_number: '', 
    role: 'customer' as 'customer' | 'reseller' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('voucher_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate API call - replace with actual API
      // For demo purposes, we'll use mock data
      if (loginForm.username === 'admin' && loginForm.password === 'admin') {
        const userData: User = {
          id: 1,
          username: 'admin',
          whatsapp_number: '628123456789@c.us',
          role: 'admin',
          balance: 1000000
        };
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('voucher_user', JSON.stringify(userData));
        toast({
          title: "Login berhasil",
          description: "Selamat datang di dashboard admin",
        });
      } else if (loginForm.username === 'reseller' && loginForm.password === 'reseller') {
        const userData: User = {
          id: 2,
          username: 'reseller',
          whatsapp_number: '628123456790@c.us',
          role: 'reseller',
          balance: 500000
        };
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('voucher_user', JSON.stringify(userData));
        toast({
          title: "Login berhasil",
          description: "Selamat datang di dashboard reseller",
        });
      } else if (loginForm.username === 'customer' && loginForm.password === 'customer') {
        const userData: User = {
          id: 3,
          username: 'customer',
          whatsapp_number: '628123456791@c.us',
          role: 'customer',
          balance: 100000
        };
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('voucher_user', JSON.stringify(userData));
        toast({
          title: "Login berhasil",
          description: "Selamat datang di dashboard customer",
        });
      } else {
        setError('Username atau password salah');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate API call - replace with actual API
      const userData: User = {
        id: Date.now(),
        username: registerForm.username,
        whatsapp_number: registerForm.whatsapp_number,
        role: registerForm.role,
        balance: 0
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('voucher_user', JSON.stringify(userData));
      
      toast({
        title: "Registrasi berhasil",
        description: `Akun ${registerForm.role} berhasil dibuat`,
      });
    } catch (err) {
      setError('Terjadi kesalahan saat registrasi');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('voucher_user');
    toast({
      title: "Logout berhasil",
      description: "Anda telah keluar dari sistem",
    });
  };

  if (isAuthenticated && user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Wifi className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Voucher Hotspot</h1>
          <p className="text-gray-600">Sistem Manajemen Voucher Mikrotik</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Masuk ke Dashboard</CardTitle>
            <CardDescription>
              Silakan login untuk mengakses sistem voucher
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Masukkan username"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Masukkan password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                      required
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Sedang login...' : 'Login'}
                  </Button>
                </form>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Demo accounts:</p>
                  <div className="space-y-1 text-xs">
                    <p><strong>Admin:</strong> admin / admin</p>
                    <p><strong>Reseller:</strong> reseller / reseller</p>
                    <p><strong>Customer:</strong> customer / customer</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-username">Username</Label>
                    <Input
                      id="reg-username"
                      type="text"
                      placeholder="Pilih username"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Buat password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      type="text"
                      placeholder="08123456789"
                      value={registerForm.whatsapp_number}
                      onChange={(e) => setRegisterForm({...registerForm, whatsapp_number: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Tipe Akun</Label>
                    <select 
                      id="role"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={registerForm.role}
                      onChange={(e) => setRegisterForm({...registerForm, role: e.target.value as 'customer' | 'reseller'})}
                    >
                      <option value="customer">Customer</option>
                      <option value="reseller">Reseller</option>
                    </select>
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Sedang daftar...' : 'Daftar'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <Shield className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-sm text-gray-600">Aman & Terpercaya</p>
          </div>
          <div className="flex flex-col items-center">
            <Users className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-sm text-gray-600">Multi Role</p>
          </div>
          <div className="flex flex-col items-center">
            <CreditCard className="h-8 w-8 text-purple-600 mb-2" />
            <p className="text-sm text-gray-600">Sistem Saldo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
