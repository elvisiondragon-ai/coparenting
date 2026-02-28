import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Trash2, Info } from "lucide-react";
import { motion } from "framer-motion";
import {
  startOfMonth, endOfMonth, eachDayOfInterval, format, addMonths, subMonths,
  isToday, startOfWeek, endOfWeek,
} from "date-fns";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CalendarPage = () => {
  const { setup, recurringSchedule, exceptions, addException, removeException } = useAppContext();
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState("");
  const [overrideForm, setOverrideForm] = useState({
    parent: 'A' as 'A' | 'B',
    reason: ''
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: setup.weekStart === 'monday' ? 1 : 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: setup.weekStart === 'monday' ? 1 : 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getDayException = (dateStr: string) => exceptions.find(e => e.date === dateStr);

  const getDayParent = (date: Date): 'A' | 'B' => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const exception = getDayException(dateStr);
    if (exception) return exception.slots.morning;
    const dayName = format(date, 'EEEE').toLowerCase();
    return recurringSchedule[dayName]?.morning || 'A';
  };

  const isCurrentMonth = (date: Date) => date.getMonth() === currentDate.getMonth();

  const openDayDialog = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existingException = getDayException(dateStr);
    setSelectedDateStr(dateStr);
    
    if (existingException) {
      setOverrideForm({ parent: existingException.slots.morning, reason: existingException.reason });
    } else {
      setOverrideForm({ parent: getDayParent(date), reason: '' });
    }
    setDialogOpen(true);
  };

  const handleSaveException = () => {
    const existingException = getDayException(selectedDateStr);
    if (existingException) {
      removeException(existingException.id);
    }
    
    addException({
      id: crypto.randomUUID(),
      date: selectedDateStr,
      slots: {
        earlyMorning: overrideForm.parent,
        morning: overrideForm.parent,
        afternoon: overrideForm.parent,
        night: overrideForm.parent,
      },
      reason: overrideForm.reason
    });
    
    setDialogOpen(false);
    toast.success(t('calendar.save_override'));
  };

  const handleRemoveException = () => {
    const existingException = getDayException(selectedDateStr);
    if (existingException) {
      removeException(existingException.id);
      setDialogOpen(false);
      toast.success(t('calendar.remove_override'));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1">{t('calendar.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('calendar.description')}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Alert className="bg-primary/5 border-primary/20 p-3 sm:p-4">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-xs sm:text-sm font-medium">
            {t('calendar.help_text')}
          </AlertDescription>
        </Alert>
      </motion.div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start bg-muted/20 p-1 rounded-lg sm:bg-transparent sm:p-0">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(d => subMonths(d, 1))} className="h-8 w-8 sm:h-9 sm:w-9">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-display text-base sm:text-xl font-bold min-w-[120px] sm:min-w-[200px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(d => addMonths(d, 1))} className="h-8 w-8 sm:h-9 sm:w-9">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4 text-[10px] sm:text-sm bg-card px-3 py-2 rounded-full shadow-sm border border-border sm:border-none sm:shadow-none w-full sm:w-auto justify-center">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded parent-a-bg" /> 
            <span className="truncate max-w-[70px] sm:max-w-none">{setup.parentAName}</span>
          </div>
          <div className="flex items-center gap-2 border-l pl-4">
            <span className="w-2.5 h-2.5 rounded parent-b-bg" /> 
            <span className="truncate max-w-[70px] sm:max-w-none">{setup.parentBName}</span>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="overflow-hidden">
          <CardContent className="p-2 sm:p-4">
            <div className="grid grid-cols-7 gap-1">
              {(setup.weekStart === 'monday' ? DAY_NAMES : ['Sun', ...DAY_NAMES.slice(0, 6)]).map(d => (
                <div key={d} className="text-center text-[10px] sm:text-xs font-bold text-muted-foreground py-2 uppercase tracking-wider">{t(`calendar.days.${d}`)}</div>
              ))}
              {days.map(day => {
                const parent = getDayParent(day);
                const inMonth = isCurrentMonth(day);
                const today = isToday(day);
                const dateStr = format(day, 'yyyy-MM-dd');
                const hasException = !!getDayException(dateStr);
                
                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => openDayDialog(day)}
                    className={`relative aspect-square flex flex-col items-center justify-center rounded-md sm:rounded-lg text-xs sm:text-sm transition-all cursor-pointer hover:ring-2 hover:ring-primary/50
                      ${!inMonth ? 'opacity-20' : ''}
                      ${today ? 'ring-2 ring-primary ring-offset-1' : ''}
                      ${parent === 'A' ? 'bg-parentA-light' : 'bg-parentB-light'}
                    `}
                  >
                    <span className="font-bold">{format(day, 'd')}</span>
                    <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-1 ${parent === 'A' ? 'parent-a-bg' : 'parent-b-bg'}`} />
                    {hasException && (
                      <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-destructive shadow-sm" title="Override Active" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Year at a glance */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader className="p-4 sm:p-6 pb-2">
            <CardTitle className="text-base sm:text-lg">{t('calendar.year_at_glance', { year: format(currentDate, 'yyyy') })}</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 pt-0">
            <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 12 }, (_, i) => {
                const monthDate = new Date(currentDate.getFullYear(), i, 1);
                const monthDays = eachDayOfInterval({ start: startOfMonth(monthDate), end: endOfMonth(monthDate) });
                return (
                  <div key={i} className="text-center border rounded-lg p-2 bg-muted/5">
                    <p className="text-[10px] sm:text-xs font-bold mb-2 text-muted-foreground uppercase">{format(monthDate, 'MMM')}</p>
                    <div className="flex flex-wrap gap-[1.5px] sm:gap-[2px] justify-center">
                      {monthDays.map(d => {
                        const p = getDayParent(d);
                        return (
                          <div
                            key={d.toISOString()}
                            className={`w-[6px] h-[6px] sm:w-[8px] sm:h-[8px] rounded-[1px] ${p === 'A' ? 'parent-a-bg' : 'parent-b-bg'}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle>{t('calendar.override_title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="bg-muted/30 p-3 rounded-lg">
              <p className="text-xs sm:text-sm font-medium">
                {t('calendar.override_desc', { date: selectedDateStr })}
              </p>
            </div>
            <div>
              <Label className="mb-2 block text-xs sm:text-sm">{t('calendar.assign_to')}</Label>
              <Select value={overrideForm.parent} onValueChange={(v: 'A' | 'B') => setOverrideForm(f => ({ ...f, parent: v }))}>
                <SelectTrigger className="bg-muted/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded parent-a-bg" /> {setup.parentAName}
                    </div>
                  </SelectItem>
                  <SelectItem value="B">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded parent-b-bg" /> {setup.parentBName}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block text-xs sm:text-sm">{t('calendar.reason')}</Label>
              <Input 
                value={overrideForm.reason} 
                onChange={e => setOverrideForm(f => ({ ...f, reason: e.target.value }))}
                placeholder="Holiday, sick day, swap..."
                className="bg-muted/30"
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSaveException} className="flex-1 h-11">
                {t('calendar.save_override')}
              </Button>
              {!!getDayException(selectedDateStr) && (
                <Button variant="destructive" onClick={handleRemoveException} size="icon" className="h-11 w-11 shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
