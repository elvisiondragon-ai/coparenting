import { useState, useMemo } from "react";
import { useAppContext, CustodySlot } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { motion } from "framer-motion";
import {
  startOfMonth, endOfMonth, eachDayOfInterval, format, getDay, addMonths, subMonths,
  isToday, startOfWeek, endOfWeek,
} from "date-fns";

const SLOT_COLORS = {
  A: 'bg-parentA text-parentA-foreground',
  B: 'bg-parentB text-parentB-foreground',
};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CalendarPage = () => {
  const { setup, recurringSchedule, exceptions } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: setup.weekStart === 'monday' ? 1 : 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: setup.weekStart === 'monday' ? 1 : 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getDayParent = (date: Date): 'A' | 'B' => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const exception = exceptions.find(e => e.date === dateStr);
    if (exception) return exception.slots.morning;
    const dayName = format(date, 'EEEE').toLowerCase();
    return recurringSchedule[dayName]?.morning || 'A';
  };

  const isCurrentMonth = (date: Date) => date.getMonth() === currentDate.getMonth();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold mb-1">Monthly Calendar</h1>
        <p className="text-muted-foreground">View custody assignments for each day.</p>
      </motion.div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(d => subMonths(d, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-display text-xl font-bold min-w-[200px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(d => addMonths(d, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded parent-a-bg" /> {setup.parentAName}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded parent-b-bg" /> {setup.parentBName}
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1">
              {(setup.weekStart === 'monday' ? DAY_NAMES : ['Sun', ...DAY_NAMES.slice(0, 6)]).map(d => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
              ))}
              {days.map(day => {
                const parent = getDayParent(day);
                const inMonth = isCurrentMonth(day);
                const today = isToday(day);
                return (
                  <div
                    key={day.toISOString()}
                    className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all cursor-default
                      ${!inMonth ? 'opacity-30' : ''}
                      ${today ? 'ring-2 ring-foreground ring-offset-2' : ''}
                      ${parent === 'A' ? 'bg-parentA-light' : 'bg-parentB-light'}
                    `}
                  >
                    <span className="font-medium">{format(day, 'd')}</span>
                    <span className={`w-2 h-2 rounded-full mt-1 ${parent === 'A' ? 'parent-a-bg' : 'parent-b-bg'}`} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Year at a glance */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Year at a Glance — {format(currentDate, 'yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }, (_, i) => {
                const monthDate = new Date(currentDate.getFullYear(), i, 1);
                const monthDays = eachDayOfInterval({ start: startOfMonth(monthDate), end: endOfMonth(monthDate) });
                return (
                  <div key={i} className="text-center">
                    <p className="text-xs font-medium mb-2 text-muted-foreground">{format(monthDate, 'MMM')}</p>
                    <div className="flex flex-wrap gap-[2px] justify-center">
                      {monthDays.map(d => {
                        const p = getDayParent(d);
                        return (
                          <div
                            key={d.toISOString()}
                            className={`w-[10px] h-[10px] rounded-[2px] ${p === 'A' ? 'parent-a-bg' : 'parent-b-bg'}`}
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
    </div>
  );
};

export default CalendarPage;
