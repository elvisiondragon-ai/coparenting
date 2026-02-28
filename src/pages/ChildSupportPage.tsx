import { useState } from "react";
import { useAppContext, ChildSupport } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

const STATUS_ICONS = {
  paid: <CheckCircle className="h-4 w-4 text-success" />,
  partial: <AlertTriangle className="h-4 w-4 text-warning" />,
  unpaid: <XCircle className="h-4 w-4 text-destructive" />,
};

const ChildSupportPage = () => {
  const { setup, childSupport, addChildSupport, getCurrency } = useAppContext();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const currency = getCurrency();
  const [form, setForm] = useState({
    month: format(new Date(), 'yyyy-MM'),
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    amountDue: '',
    amountPaid: '0',
    paymentMethod: 'Transfer',
    status: 'unpaid' as ChildSupport['status'],
  });

  const handleAdd = () => {
    if (!form.amountDue) { toast.error(t('child_support.err_amount')); return; }
    addChildSupport({
      id: crypto.randomUUID(),
      month: form.month,
      dueDate: form.dueDate,
      amountDue: parseFloat(form.amountDue),
      amountPaid: parseFloat(form.amountPaid),
      paymentMethod: form.paymentMethod,
      status: form.status,
    });
    setOpen(false);
    toast.success(t('child_support.success_added'));
  };

  const totalDue = childSupport.reduce((s, cs) => s + cs.amountDue, 0);
  const totalPaid = childSupport.reduce((s, cs) => s + cs.amountPaid, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1">{t('child_support.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('child_support.description')}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="w-full sm:w-auto shadow-sm"><Plus className="mr-2 h-4 w-4" /> {t('child_support.add_entry')}</Button></DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-lg rounded-xl">
            <DialogHeader><DialogTitle>{t('child_support.add_entry')}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>{t('child_support.month')}</Label><Input type="month" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))} className="bg-muted/30" /></div>
                <div><Label>{t('child_support.due_date')}</Label><Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="bg-muted/30" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>{t('child_support.amount_due')} ({currency})</Label><Input type="number" value={form.amountDue} onChange={e => setForm(f => ({ ...f, amountDue: e.target.value }))} className="bg-muted/30" /></div>
                <div><Label>{t('child_support.amount_paid')} ({currency})</Label><Input type="number" value={form.amountPaid} onChange={e => setForm(f => ({ ...f, amountPaid: e.target.value }))} className="bg-muted/30" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>{t('child_support.payment_method')}</Label><Input value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} className="bg-muted/30" /></div>
                <div>
                  <Label>{t('child_support.status')}</Label>
                  <Select value={form.status} onValueChange={(v: ChildSupport['status']) => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger className="bg-muted/30"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">{t('child_support.statuses.paid')}</SelectItem>
                      <SelectItem value="partial">{t('child_support.statuses.partial')}</SelectItem>
                      <SelectItem value="unpaid">{t('child_support.statuses.unpaid')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full h-11 mt-2">{t('child_support.add_entry')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">{t('child_support.total_due')}</p>
          <p className="text-2xl font-bold">{currency}{totalDue.toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">{t('child_support.total_paid')}</p>
          <p className="text-2xl font-bold text-success">{currency}{totalPaid.toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">{t('child_support.outstanding')}</p>
          <p className="text-2xl font-bold text-destructive">{currency}{(totalDue - totalPaid).toLocaleString()}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {childSupport.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">{t('child_support.no_entries')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className="text-left p-3">{t('child_support.month')}</th><th className="text-left p-3">{t('child_support.due_date')}</th>
                  <th className="text-right p-3">{t('child_support.due')}</th><th className="text-right p-3">{t('child_support.paid')}</th>
                  <th className="text-left p-3">{t('child_support.method')}</th><th className="text-center p-3">{t('child_support.status')}</th>
                </tr></thead>
                <tbody>
                  {[...childSupport].reverse().map(cs => (
                    <tr key={cs.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3 font-medium">{cs.month}</td>
                      <td className="p-3">{cs.dueDate}</td>
                      <td className="p-3 text-right">{currency}{cs.amountDue.toLocaleString()}</td>
                      <td className="p-3 text-right">{currency}{cs.amountPaid.toLocaleString()}</td>
                      <td className="p-3">{cs.paymentMethod}</td>
                      <td className="p-3 text-center">{STATUS_ICONS[cs.status]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChildSupportPage;