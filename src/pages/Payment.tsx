import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CreditCard, Phone, User, Mail, Copy, Crown, Play, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';

export default function Payment() {
  const navigate = useNavigate();
  const { is_pro } = useAppContext();
  const [selectedPlan, setSelectedPlan] = useState('1_month');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('QRIS');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);
  const [showQrisModal, setShowQrisModal] = useState(false);
  const { toast } = useToast();

  // Get current session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setEmail(session.user.email || '');
        setFullName(session.user.user_metadata?.display_name || '');
        setPhoneNumber(session.user.user_metadata?.phone || '');
      }
    });
  }, []);

  // Redirect if already pro
  useEffect(() => {
    if (is_pro) {
      toast({
        title: "Anda sudah PRO!",
        description: "Terima kasih telah berlangganan.",
      });
      navigate('/');
    }
  }, [is_pro, navigate, toast]);

  const paymentMethods = [
    { code: 'QRIS', name: 'QRIS', description: 'DANA, OVO, ShopeePay, GoPay, dll' },
    { code: 'BCAVA', name: 'BCA Virtual Account', description: 'Transfer via BCA' },
    { code: 'MANDIRIVA', name: 'Mandiri Virtual Account', description: 'Transfer via Mandiri' },
    { code: 'BNIVA', name: 'BNI Virtual Account', description: 'Transfer via BNI' },
    { code: 'BRIVA', name: 'BRI Virtual Account', description: 'Transfer via BRI' }
  ];

  const subscriptionPlans = [
    {
      id: '1_month',
      name: 'Berlangganan 1 Bulan',
      description: 'Akses penuh fitur Pro selama 30 hari',
      price: 50000,
      duration: '30 hari'
    },
    {
      id: '1_year',
      name: 'Berlangganan 1 Tahun',
      description: 'Hemat lebih banyak dengan akses tahunan',
      price: 500000,
      duration: '365 hari'
    }
  ];

  // Real-time payment status listener
  useEffect(() => {
    if (!showPaymentInstructions || !paymentData?.tripay_reference) return;

    const channel = supabase
      .channel('payment-status-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pro_subscriptions',
          filter: `tripay_reference=eq.${paymentData.tripay_reference}`
        },
        (payload) => {
          if (payload.new?.status === 'active') {
            toast({
              title: "🎉 Pembayaran Berhasil!",
              description: "Status Pro Anda telah aktif.",
            });
            // Give it a moment for the sync trigger to run
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showPaymentInstructions, paymentData?.tripay_reference, toast]);

  const handleCreatePayment = async () => {
    if (!selectedPlan || !phoneNumber || !fullName || !email) {
      toast({
        title: "Data Tidak Lengkap",
        description: "Mohon lengkapi semua data profil.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let currentUserId = user?.id;
      let currentUserEmail = email;

      if (!user) {
        if (password !== confirmPassword) {
          toast({ title: "Password Tidak Cocok", variant: "destructive" });
          setLoading(false);
          return;
        }

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: fullName, phone: phoneNumber }
          }
        });

        if (signUpError) throw signUpError;
        currentUserId = signUpData.user?.id;
        currentUserEmail = signUpData.user?.email || email;
      }

      const plan = subscriptionPlans.find(p => p.id === selectedPlan);
      
      const { data, error } = await supabase.functions.invoke('tripay-create-payment', {
        body: {
          subscriptionType: plan?.id,
          paymentMethod: selectedPaymentMethod,
          userName: fullName,
          userEmail: currentUserEmail,
          phoneNumber: phoneNumber,
          amount: plan?.price
        }
      });

      if (error) throw error;

      if (data?.success) {
        setPaymentData(data);
        setShowPaymentInstructions(true);
      } else {
        throw new Error(data?.error || "Gagal membuat pembayaran");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal memproses pembayaran.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (showPaymentInstructions) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6 pb-32">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setShowPaymentInstructions(false)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Instruksi Pembayaran</h1>
        </div>

        <div className="text-center bg-orange-100 text-orange-800 py-2 rounded-full text-sm font-medium">
          Menunggu Pembayaran
        </div>

        {paymentData?.payCode && paymentData?.paymentMethod !== 'QRIS' && (
          <Card className="border-2 border-yellow-400 bg-yellow-50 text-center p-6">
            <CardTitle className="text-amber-800 mb-2">Virtual Account {selectedPaymentMethod}</CardTitle>
            <div className="text-3xl font-mono font-bold text-amber-900 my-4">{paymentData.payCode}</div>
            <Button variant="outline" size="sm" onClick={() => {
              navigator.clipboard.writeText(paymentData.payCode);
              toast({ title: "Disalin!" });
            }}>
              <Copy className="w-4 h-4 mr-2" /> Salin Nomor VA
            </Button>
          </Card>
        )}

        {paymentData?.qrUrl && (
          <Card className="border-2 border-purple-400 p-6 text-center">
            <CardTitle className="mb-4">Scan QRIS</CardTitle>
            <img src={paymentData.qrUrl} alt="QRIS" className="w-64 h-64 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Screenshot dan bayar pakai aplikasi bank/e-wallet Anda</p>
          </Card>
        )}

        <Card>
          <CardHeader className="text-center">
            <CardTitle>{formatCurrency(paymentData?.amount)}</CardTitle>
            <p className="text-sm text-muted-foreground">Total Pembayaran (Ref: {paymentData?.tripay_reference})</p>
          </CardHeader>
        </Card>

        <Button onClick={() => navigate('/')} variant="outline" className="w-full">
          Kembali ke Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 pb-32">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold font-display">Upgrade ke PRO</h1>
      </div>

      <div className="space-y-6">
        <section className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5" /> Informasi Profil
          </h3>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nama Anda" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@contoh.com" disabled={!!user} />
            </div>
            <div className="space-y-2">
              <Label>Nomor Telepon</Label>
              <Input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="08xxxx" />
            </div>
            {!user && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Konfirmasi Password</Label>
                  <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" /> Pilih Paket
          </h3>
          <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="grid gap-4">
            {subscriptionPlans.map(plan => (
              <Label key={plan.id} className="cursor-pointer">
                <div className={`p-4 rounded-xl border-2 transition-all ${selectedPlan === plan.id ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold">{plan.name}</div>
                      <div className="text-xs text-muted-foreground">{plan.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{formatCurrency(plan.price)}</div>
                      <div className="text-xs text-muted-foreground">{plan.duration}</div>
                    </div>
                  </div>
                  <RadioGroupItem value={plan.id} className="sr-only" />
                </div>
              </Label>
            ))}
          </RadioGroup>Section
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Metode Pembayaran</h3>
          <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod} className="grid gap-2">
            {paymentMethods.map(method => (
              <Label key={method.code} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value={method.code} />
                <div>
                  <div className="text-sm font-medium">{method.name}</div>
                  <div className="text-xs text-muted-foreground">{method.description}</div>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </section>

        <Button 
          onClick={handleCreatePayment} 
          disabled={loading} 
          className="w-full h-12 text-lg font-bold"
        >
          {loading ? "Memproses..." : `Bayar Sekarang`}
        </Button>
      </div>
    </div>
  );
}
