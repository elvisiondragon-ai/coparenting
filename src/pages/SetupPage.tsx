import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Save, Plus, X } from "lucide-react";
import { toast } from "sonner";

const SetupPage = () => {
  const { setup, updateSetup } = useAppContext();
  const [form, setForm] = useState({
    parentAName: setup.parentAName,
    parentBName: setup.parentBName,
    children: [...setup.children],
    currency: setup.currency,
    startYear: setup.startYear,
    weekStart: setup.weekStart,
  });
  const [newChild, setNewChild] = useState("");

  const addChild = () => {
    if (newChild.trim()) {
      setForm(f => ({ ...f, children: [...f.children, newChild.trim()] }));
      setNewChild("");
    }
  };

  const removeChild = (index: number) => {
    setForm(f => ({ ...f, children: f.children.filter((_, i) => i !== index) }));
  };

  const handleSave = () => {
    if (!form.parentAName.trim() || !form.parentBName.trim()) {
      toast.error("Please enter both parent names");
      return;
    }
    if (form.children.length === 0) {
      toast.error("Please add at least one child");
      return;
    }
    updateSetup(form);
    toast.success("Setup saved successfully!");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold mb-1">Setup</h1>
        <p className="text-muted-foreground">Configure your co-parenting tracker.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle>Parent Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parentA" className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full parent-a-bg" />
                  Parent A Name
                </Label>
                <Input id="parentA" value={form.parentAName} onChange={e => setForm(f => ({ ...f, parentAName: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="parentB" className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full parent-b-bg" />
                  Parent B Name
                </Label>
                <Input id="parentB" value={form.parentBName} onChange={e => setForm(f => ({ ...f, parentBName: e.target.value }))} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle>Children</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {form.children.map((child, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
                  {child}
                  <button onClick={() => removeChild(i)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Child's name" value={newChild} onChange={e => setNewChild(e.target.value)} onKeyDown={e => e.key === 'Enter' && addChild()} />
              <Button variant="outline" size="icon" onClick={addChild}><Plus className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="mb-2 block">Currency</Label>
                <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$">$ (USD)</SelectItem>
                    <SelectItem value="Rp">Rp (IDR)</SelectItem>
                    <SelectItem value="€">€ (EUR)</SelectItem>
                    <SelectItem value="£">£ (GBP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">Start Year</Label>
                <Input type="number" value={form.startYear} onChange={e => setForm(f => ({ ...f, startYear: parseInt(e.target.value) || 2026 }))} />
              </div>
              <div>
                <Label className="mb-2 block">Week Starts On</Label>
                <Select value={form.weekStart} onValueChange={(v: 'sunday' | 'monday') => setForm(f => ({ ...f, weekStart: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Button onClick={handleSave} className="w-full" size="lg">
          <Save className="mr-2 h-4 w-4" /> Save Setup
        </Button>
      </motion.div>
    </div>
  );
};

export default SetupPage;
