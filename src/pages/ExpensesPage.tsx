import { useState } from "react";
import { useAppContext, Expense } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

const CATEGORIES = ['School', 'Medical', 'Clothes', 'Food', 'Activities', 'Other'];

const ExpensesPage = () => {
  const { setup, expenses, addExpense, removeExpense } = useAppContext();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    category: 'Other',
    amount: '',
    paidBy: 'A' as 'A' | 'B',
    splitA: '50',
    splitB: '50',
  });

  const handleAdd = () => {
    if (!form.description || !form.amount) { toast.error("Fill all fields"); return; }
    addExpense({
      id: crypto.randomUUID(),
      date: form.date,
      description: form.description,
      category: form.category,
      amount: parseFloat(form.amount),
      paidBy: form.paidBy,
      splitA: parseInt(form.splitA),
      splitB: parseInt(form.splitB),
    });
    setForm({ date: format(new Date(), 'yyyy-MM-dd'), description: '', category: 'Other', amount: '', paidBy: 'A', splitA: '50', splitB: '50' });
    setOpen(false);
    toast.success("Expense added");
  };

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const parentAOwes = expenses.filter(e => e.paidBy === 'B').reduce((s, e) => s + (e.amount * e.splitA / 100), 0);
  const parentBOwes = expenses.filter(e => e.paidBy === 'A').reduce((s, e) => s + (e.amount * e.splitB / 100), 0);
  const balance = parentBOwes - parentAOwes;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Expenses</h1>
          <p className="text-muted-foreground">Track shared costs and balances.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Expense</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Amount ({setup.currency})</Label><Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} /></div>
                <div>
                  <Label>Paid By</Label>
                  <Select value={form.paidBy} onValueChange={(v: 'A' | 'B') => setForm(f => ({ ...f, paidBy: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">{setup.parentAName}</SelectItem>
                      <SelectItem value="B">{setup.parentBName}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{setup.parentAName}'s Share (%)</Label><Input type="number" value={form.splitA} onChange={e => setForm(f => ({ ...f, splitA: e.target.value, splitB: String(100 - parseInt(e.target.value || '0')) }))} /></div>
                <div><Label>{setup.parentBName}'s Share (%)</Label><Input type="number" value={form.splitB} disabled /></div>
              </div>
              <Button onClick={handleAdd} className="w-full">Add Expense</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-2xl font-bold">{setup.currency}{totalExpenses.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className={`text-2xl font-bold ${balance > 0 ? 'parent-b-text' : balance < 0 ? 'parent-a-text' : ''}`}>
              {balance === 0 ? 'Even' : `${balance > 0 ? setup.parentBName : setup.parentAName} owes ${setup.currency}${Math.abs(balance).toFixed(0)}`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">Entries</p>
            <p className="text-2xl font-bold">{expenses.length}</p>
          </CardContent>
        </Card>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardContent className="p-0">
            {expenses.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No expenses yet. Click "Add Expense" to start tracking.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b">
                    <th className="text-left p-3">Date</th><th className="text-left p-3">Description</th>
                    <th className="text-left p-3">Category</th><th className="text-right p-3">Amount</th>
                    <th className="text-center p-3">Paid By</th><th className="text-center p-3">Split</th>
                    <th className="p-3"></th>
                  </tr></thead>
                  <tbody>
                    {[...expenses].reverse().map(exp => (
                      <tr key={exp.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-3">{exp.date}</td>
                        <td className="p-3 font-medium">{exp.description}</td>
                        <td className="p-3"><span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-xs">{exp.category}</span></td>
                        <td className="p-3 text-right font-medium">{setup.currency}{exp.amount.toLocaleString()}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-block w-6 h-6 rounded-full text-xs font-bold leading-6 ${exp.paidBy === 'A' ? 'parent-a-bg text-parentA-foreground' : 'parent-b-bg text-parentB-foreground'}`}>
                            {exp.paidBy}
                          </span>
                        </td>
                        <td className="p-3 text-center text-xs text-muted-foreground">{exp.splitA}/{exp.splitB}</td>
                        <td className="p-3">
                          <Button variant="ghost" size="icon" onClick={() => removeExpense(exp.id)} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ExpensesPage;
