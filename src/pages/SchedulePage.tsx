import { useAppContext, CustodySlot } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const SLOTS: (keyof CustodySlot)[] = ['earlyMorning', 'morning', 'afternoon', 'night'];

const SchedulePage = () => {
  const { setup, recurringSchedule, setRecurringSchedule } = useAppContext();
  const { t } = useTranslation();

  const toggleSlot = (day: string, slot: keyof CustodySlot) => {
    const current = recurringSchedule[day];
    setRecurringSchedule(day, {
      ...current,
      [slot]: current[slot] === 'A' ? 'B' : 'A',
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold mb-1">{t('schedule.title')}</h1>
        <p className="text-muted-foreground">
          {t('schedule.description')}{" "}
          <span className="parent-a-text font-semibold">{setup.parentAName}</span> {t('schedule.and')}{" "}
          <span className="parent-b-text font-semibold">{setup.parentBName}</span>.
        </p>
      </motion.div>

      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded parent-a-bg" />
          <span>{setup.parentAName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded parent-b-bg" />
          <span>{setup.parentBName}</span>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-muted-foreground">{t('schedule.day')}</th>
                  {SLOTS.map(slot => (
                    <th key={slot} className="p-3 text-center font-medium text-muted-foreground">{t(`schedule.slots.${slot}`)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map(day => (
                  <tr key={day} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3 font-medium capitalize sticky left-0 bg-background sm:bg-transparent shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] sm:shadow-none">{t(`schedule.days.${day}`)}</td>
                    {SLOTS.map(slot => {
                      const parent = recurringSchedule[day]?.[slot] || 'A';
                      const parentName = parent === 'A' ? setup.parentAName : setup.parentBName;
                      return (
                        <td key={slot} className="p-1 sm:p-2 text-center min-w-[80px]">
                          <button
                            onClick={() => toggleSlot(day, slot)}
                            className={`w-full py-2 rounded-md text-[10px] sm:text-xs font-bold transition-colors truncate px-1 ${
                              parent === 'A'
                                ? 'bg-parentA text-parentA-foreground hover:opacity-80'
                                : 'bg-parentB text-parentB-foreground hover:opacity-80'
                            }`}
                            title={parentName}
                          >
                            {parentName}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SchedulePage;