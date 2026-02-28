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

const STATUS_ICONS = {
  paid: <CheckCircle className="h-4 w-4 text-success" />,
  partial: <AlertTriangle className="h-4 w-4 text-warning" />,
  unpaid: <XCircle className="h-4 w-4 text-destructive" />,
};

const ChildSupportPage = () => {
  const { setup, childSupport, addChildSupport, updateChildSupport } = useAppContext();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    month: format(new Date(), 'yyyy-MM'),
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    amountDue: '',
    amountPaid: '0',
    paymentMethod: 'Transfer',
    status: 'unpaid' as ChildSupport['status'],
  });

  const handleAdd = () => {
    if (!form.amountDue) { toast.error("Enter amount due"); return; }
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
    toast.success("Child support entry added");
  };

  const totalDue = childSupport.reduce((s, cs) => s + cs.amountDue, 0);
  const totalPaid = childSupport.reduce((s, cs) => s + cs.amountPaid, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Child Support</h1>
          <p className="text-muted-foreground">Track monthly support payments.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Entry</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Child Support Entry</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Month</Label><Input type="month" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))} /></div>
                <div><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Amount Due ({setup.currency})</Label><Input type="number" value={form.amountDue} onChange={e => setForm(f => ({ ...f, amountDue: e.target.value }))} /></div>
                <div><Label>Amount Paid ({setup.currency})</Label><Input type="number" value={form.amountPaid} onChange={e => setForm(f => ({ ...f, amountPaid: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Payment Method</Label><Input value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} /></div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v: ChildSupport['status']) => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">✅ Paid</SelectItem>
                      <SelectItem value="partial">⚠️ Partial</SelectItem>
                      <SelectItem value="unpaid">❌ Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full">Add Entry</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">Total Due</p>
          <p className="text-2xl font-bold">{setup.currency}{totalDue.toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">Total Paid</p>
          <p className="text-2xl font-bold text-success">{setup.currency}{totalPaid.toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">Outstanding</p>
          <p className="text-2xl font-bold text-destructive">{setup.currency}{(totalDue - totalPaid).toLocaleString()}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {childSupport.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No entries yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className="text-left p-3">Month</th><th className="text-left p-3">Due Date</th>
                  <th className="text-right p-3">Due</th><th className="text-right p-3">Paid</th>
                  <th className="text-left p-3">Method</th><th className="text-center p-3">Status</th>
                </tr></thead>
                <tbody>
                  {[...childSupport].reverse().map(cs => (
                    <tr key={cs.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3 font-medium">{cs.month}</td>
                      <td className="p-3">{cs.dueDate}</td>
                      <td className="p-3 text-right">{setup.currency}{cs.amountDue.toLocaleString()}</td>
                      <td className="p-3 text-right">{setup.currency}{cs.amountPaid.toLocaleString()}</td>
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
