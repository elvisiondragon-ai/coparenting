import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, DollarSign, ListTodo, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const Dashboard = () => {
  const { setup, expenses, tasks, notes, childSupport, getCurrency } = useAppContext();
  const { t } = useTranslation();
  const today = new Date();
  const currency = getCurrency();

  const pendingTasks = tasks.filter(t => t.status !== 'done').length;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const parentAOwes = expenses
    .filter(e => e.paidBy === 'B')
    .reduce((sum, e) => sum + (e.amount * e.splitA / 100), 0);
  const parentBOwes = expenses
    .filter(e => e.paidBy === 'A')
    .reduce((sum, e) => sum + (e.amount * e.splitB / 100), 0);
  const balance = parentBOwes - parentAOwes;
  const unpaidSupport = childSupport.filter(cs => cs.status !== 'paid').length;
  const recentNotes = notes.slice(-3).reverse();

  if (!setup.isConfigured) {
    return (
      <motion.div {...fadeIn} className="max-w-lg mx-auto text-center py-20 space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-4">{t('dashboard.welcome_title')}</h1>
          <p className="text-muted-foreground mb-8">
            {t('dashboard.welcome_desc')}
          </p>
          <Link
            to="/setup"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            {t('dashboard.get_started')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <Alert className="bg-blue-50 border-blue-200 text-blue-800 text-left shadow-sm">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm font-medium leading-relaxed">
            {t('dashboard.shared_account_notice')}
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  const statCards = [
    {
      title: t('dashboard.today'),
      value: format(today, "EEEE, MMM d"),
      subtitle: format(today, "yyyy"),
      icon: CalendarDays,
      color: "text-primary",
    },
    {
      title: t('dashboard.pending_tasks'),
      value: pendingTasks.toString(),
      subtitle: t('dashboard.total_tasks', { count: tasks.length }),
      icon: ListTodo,
      color: "text-warning",
    },
    {
      title: t('dashboard.total_expenses'),
      value: `${currency}${totalExpenses.toLocaleString()}`,
      subtitle: balance > 0
        ? t('dashboard.owes', { parent: setup.parentBName, amount: `${currency}${Math.abs(balance).toFixed(0)}` })
        : balance < 0
        ? t('dashboard.owes', { parent: setup.parentAName, amount: `${currency}${Math.abs(balance).toFixed(0)}` })
        : t('dashboard.balanced'),
      icon: DollarSign,
      color: "text-success",
    },
    {
      title: t('dashboard.notes'),
      value: notes.length.toString(),
      subtitle: unpaidSupport > 0 ? t('dashboard.unpaid_support', { count: unpaidSupport }) : t('dashboard.all_support_paid'),
      icon: BookOpen,
      color: "text-accent",
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <motion.div {...fadeIn} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">{t('dashboard.dashboard_title')}</h1>
          <p className="text-muted-foreground">
            {t('dashboard.hello', { parentA: setup.parentAName, parentB: setup.parentBName })}
          </p>
        </div>
        
        <Alert className="bg-blue-50 border-blue-200 text-blue-800 max-w-md shadow-sm">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs font-medium">
            {t('dashboard.shared_account_notice')}
          </AlertDescription>
        </Alert>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={card.title} {...fadeIn} transition={{ delay: i * 0.08, duration: 0.4 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('dashboard.upcoming_tasks')}</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.filter(t => t.status !== 'done').length === 0 ? (
                <p className="text-muted-foreground text-sm">{t('dashboard.no_pending_tasks')} <Link to="/tasks" className="text-primary underline">{t('dashboard.add_one')}</Link></p>
              ) : (
                <div className="space-y-3">
                  {tasks.filter(t => t.status !== 'done').slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('dashboard.due')}: {task.dueDate} · {task.assignedTo === 'A' ? setup.parentAName : task.assignedTo === 'B' ? setup.parentBName : t('dashboard.both')}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                        task.priority === 'medium' ? 'bg-warning/10 text-warning' :
                        'bg-muted text-muted-foreground'
                      }`}>{task.priority}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('dashboard.recent_notes')}</CardTitle>
            </CardHeader>
            <CardContent>
              {recentNotes.length === 0 ? (
                <p className="text-muted-foreground text-sm">{t('dashboard.no_notes_yet')} <Link to="/notes" className="text-primary underline">{t('dashboard.add_one')}</Link></p>
              ) : (
                <div className="space-y-3">
                  {recentNotes.map(note => (
                    <div key={note.id} className="py-2 border-b last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${note.author === 'A' ? 'parent-a-bg' : 'parent-b-bg'}`} />
                        <span className="text-xs text-muted-foreground">
                          {note.author === 'A' ? setup.parentAName : setup.parentBName} · {note.date}
                        </span>
                      </div>
                      <p className="text-sm line-clamp-2">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
