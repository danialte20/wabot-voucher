import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  role: 'admin' | 'reseller' | 'customer';
  balance: number;
}

interface Transaction {
  id: number;
  type: 'topup' | 'purchase' | 'commission';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

interface BalanceManagementProps {
  user: User;
}

const BalanceManagement = ({ user }: BalanceManagementProps) => {
  const [topupAmount, setTopupAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Mock transaction data
  const transactions: Transaction[] = [
    {
      id: 1,
      type: 'topup',
      amount: 100000,
      description: 'Top up saldo via transfer bank',
      status: 'completed',
      created_at: '2024-01-15 10:30:00'
    },
    {
      id: 2,
      type: 'purchase',
      amount: -10000,
      description: 'Pembelian voucher 3 Jam - VOC789012',
      status: 'completed',
      created_at: '2024-01-15 09:15:00'
    },
    {
      id: 3,
      type: 'commission',
      amount: 2000,
      description: 'Komisi penjualan voucher VOC123456',
      status: 'completed',
      created_at: '2024-01-14 16:45:00'
    },
    {
      id: 4,
      type: 'topup',
      amount: 50000,
      description: 'Top up saldo via e-wallet',
      status: 'pending',
      created_at: '2024-01-14 14:20:00'
    }
  ];

  const quickTopupAmounts = [50000, 100000, 200000, 500000];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'topup':
        return <ArrowDownRight className="h-4 w-4 text-green-600" />;
      case 'purchase':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'commission':
        return <ArrowDownRight className="h-4 w-4 text-blue-600" />;
      default:
        return <Wallet className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Berhasil</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Gagal</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleTopup = async (amount: number) => {
    if (amount <= 0) {
      toast({
        title: "Error",
        description: "Jumlah top up harus lebih dari 0",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Permintaan top up berhasil",
        description: `Permintaan top up sebesar Rp. ${amount.toLocaleString('id-ID')} telah dikirim. Silakan lakukan pembayaran sesuai instruksi yang diberikan.`,
      });
      
      setTopupAmount('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memproses top up",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Aktif</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rp. {user.balance.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground">
              Saldo yang dapat digunakan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengeluaran Bulan Ini</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              Rp. 150,000
            </div>
            <p className="text-xs text-muted-foreground">
              Total pembelian voucher
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Komisi Bulan Ini</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              Rp. 25,000
            </div>
            <p className="text-xs text-muted-foreground">
              Komisi dari penjualan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Up Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Top Up Saldo
          </CardTitle>
          <CardDescription>
            Tambah saldo untuk membeli voucher atau keperluan lainnya
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="topup-amount">Jumlah Top Up</Label>
              <Input
                id="topup-amount"
                type="number"
                placeholder="Masukkan jumlah"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Nominal Cepat</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {quickTopupAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    onClick={() => setTopupAmount(amount.toString())}
                    className="h-12"
                  >
                    Rp. {amount.toLocaleString('id-ID')}
                  </Button>
                ))}
              </div>
            </div>

            <Button 
              onClick={() => handleTopup(parseInt(topupAmount) || 0)} 
              disabled={loading || !topupAmount}
              className="w-full"
            >
              {loading ? <Clock className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              {loading ? 'Memproses...' : 'Top Up Sekarang'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
          <CardDescription>
            Daftar semua transaksi saldo dan pembelian
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <p className={`font-semibold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}Rp. {Math.abs(transaction.amount).toLocaleString('id-ID')}
                    </p>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BalanceManagement;
