import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  UserPlus,
  Wallet,
  Phone
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface UserData {
  id: number;
  username: string;
  whatsapp_number: string;
  role: 'admin' | 'reseller' | 'customer';
  balance: number;
  created_at: string;
  last_activity: string;
}

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Mock user data
  const users: UserData[] = [
    {
      id: 1,
      username: 'admin',
      whatsapp_number: '628123456789@c.us',
      role: 'admin',
      balance: 1000000,
      created_at: '2024-01-01 00:00:00',
      last_activity: '2024-01-15 10:30:00'
    },
    {
      id: 2,
      username: 'reseller1',
      whatsapp_number: '628123456790@c.us',
      role: 'reseller',
      balance: 500000,
      created_at: '2024-01-05 08:15:00',
      last_activity: '2024-01-15 09:45:00'
    },
    {
      id: 3,
      username: 'customer1',
      whatsapp_number: '628123456791@c.us',
      role: 'customer',
      balance: 100000,
      created_at: '2024-01-10 14:20:00',
      last_activity: '2024-01-15 11:00:00'
    },
    {
      id: 4,
      username: 'reseller2',
      whatsapp_number: '628123456792@c.us',
      role: 'reseller',
      balance: 250000,
      created_at: '2024-01-12 16:30:00',
      last_activity: '2024-01-14 20:15:00'
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'reseller': return 'bg-blue-100 text-blue-800';
      case 'customer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'reseller': return 'Reseller';
      case 'customer': return 'Pelanggan';
      default: return role;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.whatsapp_number.includes(searchTerm);
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleUpdateBalance = async (userId: number, newBalance: number) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Saldo berhasil diupdate",
        description: `Saldo user telah diubah menjadi Rp. ${newBalance.toLocaleString('id-ID')}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengupdate saldo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "User berhasil dihapus",
        description: "User telah dihapus dari sistem",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus user",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Pengguna terdaftar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Administrator
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reseller</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === 'reseller').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Reseller aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.role === 'customer').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Pelanggan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Cari & Filter User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <Label htmlFor="search">Cari User</Label>
              <Input
                id="search"
                placeholder="Username atau nomor WhatsApp"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="role-filter">Filter Role</Label>
              <select 
                id="role-filter"
                className="w-full p-2 border border-gray-300 rounded-md mt-1"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="all">Semua Role</option>
                <option value="admin">Admin</option>
                <option value="reseller">Reseller</option>
                <option value="customer">Customer</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar User</CardTitle>
          <CardDescription>
            Kelola semua pengguna yang terdaftar di sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold">{user.username}</p>
                      <Badge className={getRoleColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {user.whatsapp_number.replace('@c.us', '')}
                      </span>
                      <span className="flex items-center">
                        <Wallet className="h-3 w-3 mr-1" />
                        Rp. {user.balance.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Bergabung: {new Date(user.created_at).toLocaleDateString('id-ID')} | 
                      Aktif terakhir: {new Date(user.last_activity).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const newBalance = prompt(`Update saldo untuk ${user.username}:`, user.balance.toString());
                      if (newBalance) {
                        handleUpdateBalance(user.id, parseInt(newBalance));
                      }
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
