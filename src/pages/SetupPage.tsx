import { useState, useRef } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Save, Plus, X, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const SetupPage = () => {
  const { setup, updateSetup, restoreData, ...allState } = useAppContext();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      toast.error(t('setup.err_both_names'));
      return;
    }
    if (form.children.length === 0) {
      toast.error(t('setup.err_one_child'));
      return;
    }
    updateSetup(form);
    toast.success(t('setup.success_saved'));
  };

  const handleExport = () => {
    try {
      const dataToExport = {
        setup: allState.setup,
        recurringSchedule: allState.recurringSchedule,
        exceptions: allState.exceptions,
        expenses: allState.expenses,
        childSupport: allState.childSupport,
        tasks: allState.tasks,
        notes: allState.notes,
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `coparenting-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully!");
    } catch (err) {
      toast.error("Failed to export data");
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        // Basic validation
        if (json.setup && json.expenses && json.tasks) {
          restoreData(json);
          toast.success("Data restored successfully!");
          // Reload form with new setup
          setForm({
            parentAName: json.setup.parentAName,
            parentBName: json.setup.parentBName,
            children: [...json.setup.children],
            currency: json.setup.currency,
            startYear: json.setup.startYear,
            weekStart: json.setup.weekStart,
          });
        } else {
          toast.error("Invalid backup file format");
        }
      } catch (err) {
        toast.error("Failed to parse backup file");
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1">{t('setup.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('setup.description')}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle>{t('setup.parent_info')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parentA" className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full parent-a-bg" />
                  {t('setup.parent_a_name')}
                </Label>
                <Input id="parentA" value={form.parentAName} onChange={e => setForm(f => ({ ...f, parentAName: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="parentB" className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full parent-b-bg" />
                  {t('setup.parent_b_name')}
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
            <CardTitle>{t('setup.children')}</CardTitle>
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
              <Input placeholder={t('setup.child_name_placeholder')} value={newChild} onChange={e => setNewChild(e.target.value)} onKeyDown={e => e.key === 'Enter' && addChild()} />
              <Button variant="outline" size="icon" onClick={addChild}><Plus className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader>
            <CardTitle>{t('setup.preferences')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="mb-2 block">{t('setup.currency')}</Label>
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
                <Label className="mb-2 block">{t('setup.start_year')}</Label>
                <Input type="number" value={form.startYear} onChange={e => setForm(f => ({ ...f, startYear: parseInt(e.target.value) || 2026 }))} />
              </div>
              <div>
                <Label className="mb-2 block">{t('setup.week_starts_on')}</Label>
                <Select value={form.weekStart} onValueChange={(v: 'sunday' | 'monday') => setForm(f => ({ ...f, weekStart: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">{t('setup.monday')}</SelectItem>
                    <SelectItem value="sunday">{t('setup.sunday')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="flex flex-col gap-4">
          <Button onClick={handleSave} className="w-full" size="lg">
            <Save className="mr-2 h-4 w-4" /> {t('setup.save_setup')}
          </Button>
          
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wider">Backup & Restore</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
                <Download className="h-4 w-4" /> Export Backup
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
                <Upload className="h-4 w-4" /> Import Backup
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImport} 
                accept=".json" 
                className="hidden" 
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center italic">
              *Backup files contain all your shared data including expenses, schedules, and tasks.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SetupPage;