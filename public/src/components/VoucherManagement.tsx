import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  Search, 
  Eye, 
  ShoppingCart, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  role: 'admin' | 'reseller' | 'customer';
  balance: number;
}

interface Voucher {
  id: number;
  voucher_code: string;
  profile_name: string;
  price_customer: number;
  price_reseller: number;
  status: 'pending' | 'active' | 'used' | 'expired';
  generated_by: string;
  activated_at?: string;
  expires_at?: string;
}

interface VoucherManagementProps {
  user: User;
}

const VoucherManagement = ({ user }: VoucherManagementProps) => {
  const [searchCode, setSearchCode] = useState('');
  const [selectedProfile, setSelectedProfile] = useState('');
  const [voucherDetails, setVoucherDetails] = useState<Voucher | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Mock data
  const voucherProfiles = [
    { name: '1 Jam', price_customer: 5000, price_reseller: 4000 },
    { name: '3 Jam', price_customer: 10000, price_reseller: 8000 },
    { name: '6 Jam', price_customer: 18000, price_reseller: 15000 },
    { name: '12 Jam', price_customer: 30000, price_reseller: 25000 },
    { name: '24 Jam', price_customer: 50000, price_reseller: 40000 },
  ];

  const recentVouchers: Voucher[] = [
    {
      id: 1,
      voucher_code: 'VOC123456',
      profile_name: '1 Jam',
      price_customer: 5000,
      price_reseller: 4000,
      status: 'active',
      generated_by: 'admin',
      activated_at: '2024-01-15 10:30:00',
      expires_at: '2024-01-15 11:30:00'
    },
    {
      id: 2,
      voucher_code: 'VOC789012',
      profile_name: '3 Jam',
      price_customer: 10000,
      price_reseller: 8000,
      status: 'pending',
      generated_by: 'reseller1'
    },
    {
      id: 3,
      voucher_code: 'VOC345678',
      profile_name: '24 Jam',
      price_customer: 50000,
      price_reseller: 40000,
      status: 'used',
      generated_by: 'admin',
      activated_at: '2024-01-14 09:00:00',
      expires_at: '2024-01-15 09:00:00'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Aktif</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'used':
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="h-3 w-3 mr-1" />Terpakai</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Kadaluarsa</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSearchVoucher = async () => {
    if (!searchCode.trim()) {
      toast({
        title: "Error",
        description: "Masukkan kode voucher yang ingin dicari",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const voucher = recentVouchers.find(v => v.voucher_code === searchCode.toUpperCase());
      if (voucher) {
        setVoucherDetails(voucher);
        toast({
          title: "Voucher ditemukan",
          description: `Detail voucher ${voucher.voucher_code} berhasil dimuat`,
        });
      } else {
        setVoucherDetails(null);
        toast({
          title: "Voucher tidak ditemukan",
          description: "Kode voucher yang Anda masukkan tidak valid",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mencari voucher",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuyVoucher = async (profileName: string) => {
    if (!profileName) {
      toast({
        title: "Error",
        description: "Pilih profil voucher yang ingin dibeli",
        variant: "destructive"
      });
      return;
    }

    const profile = voucherProfiles.find(p => p.name === profileName);
    if (!profile) return;

    const price = user.role === 'reseller' ? profile.price_reseller : profile.price_customer;
    
    if (user.balance < price) {
      toast({
        title: "Saldo tidak cukup",
        description: `Saldo Anda tidak mencukupi untuk membeli voucher ${profileName}`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newVoucherCode = 'VOC' + Math.random().toString(36).substr(2, 6).toUpperCase();
      
      toast({
        title: "Voucher berhasil dibeli",
        description: `Kode voucher: ${newVoucherCode}`,
      });
      
      // Reset form
      setSelectedProfile('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat membeli voucher",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Voucher */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Cek Voucher
          </CardTitle>
          <CardDescription>
            Masukkan kode voucher untuk melihat detail dan status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="voucher-code">Kode Voucher</Label>
              <Input
                id="voucher-code"
                placeholder="VOC123456"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearchVoucher} disabled={loading}>
                {loading ? <Clock className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                Cari
              </Button>
            </div>
          </div>

          {voucherDetails && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-3">🎫 Detail Voucher {voucherDetails.voucher_code}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Status:</strong> {getStatusBadge(voucherDetails.status)}</p>
                  <p><strong>Profil:</strong> {voucherDetails.profile_name}</p>
                  <p><strong>Harga Pelanggan:</strong> Rp. {voucherDetails.price_customer.toLocaleString('id-ID')}</p>
                  {(user.role === 'admin' || user.role === 'reseller') && (
                    <p><strong>Harga Reseller:</strong> Rp. {voucherDetails.price_reseller.toLocaleString('id-ID')}</p>
                  )}
                </div>
                <div>
                  <p><strong>Dibuat oleh:</strong> {voucherDetails.generated_by}</p>
                  {voucherDetails.activated_at && (
                    <>
                      <p><strong>Diaktifkan:</strong> {new Date(voucherDetails.activated_at).toLocaleString('id-ID')}</p>
                      <p><strong>Berakhir:</strong> {new Date(voucherDetails.expires_at!).toLocaleString('id-ID')}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Buy Voucher */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Beli Voucher
          </CardTitle>
          <CardDescription>
            Pilih profil voucher yang ingin dibeli
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {voucherProfiles.map((profile) => {
              const price = user.role === 'reseller' ? profile.price_reseller : profile.price_customer;
              const canAfford = user.balance >= price;
              
              return (
                <div
                  key={profile.name}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedProfile === profile.name 
                      ? 'border-blue-500 bg-blue-50' 
                      : canAfford 
                        ? 'border-gray-200 hover:border-gray-300' 
                        : 'border-gray-200 opacity-50'
                  }`}
                  onClick={() => canAfford && setSelectedProfile(profile.name)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{profile.name}</h4>
                    {!canAfford && <Badge variant="destructive">Saldo kurang</Badge>}
                  </div>
                  <p className="text-2xl font-bold text-green-600 mb-2">
                    Rp. {price.toLocaleString('id-ID')}
                  </p>
                  {user.role === 'reseller' && (
                    <p className="text-sm text-gray-500">
                      Harga customer: Rp. {profile.price_customer.toLocaleString('id-ID')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {selectedProfile && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">Voucher dipilih: {selectedProfile}</p>
                  <p className="text-sm text-gray-600">
                    Harga: Rp. {(user.role === 'reseller' 
                      ? voucherProfiles.find(p => p.name === selectedProfile)?.price_reseller 
                      : voucherProfiles.find(p => p.name === selectedProfile)?.price_customer
                    )?.toLocaleString('id-ID')}
                  </p>
                </div>
                <Button onClick={() => handleBuyVoucher(selectedProfile)} disabled={loading}>
                  {loading ? <Clock className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Beli Sekarang
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Vouchers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Voucher Terbaru
          </CardTitle>
          <CardDescription>
            Daftar voucher yang baru saja dibuat atau digunakan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentVouchers.map((voucher) => (
              <div key={voucher.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                      {voucher.voucher_code}
                    </code>
                    {getStatusBadge(voucher.status)}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Profil: {voucher.profile_name} | Dibuat oleh: {voucher.generated_by}</p>
                    {voucher.activated_at && (
                      <p>Diaktifkan: {new Date(voucher.activated_at).toLocaleString('id-ID')}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    Rp. {(user.role === 'reseller' ? voucher.price_reseller : voucher.price_customer).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoucherManagement;
