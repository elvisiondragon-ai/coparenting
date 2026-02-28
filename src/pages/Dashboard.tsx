import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, DollarSign, ListTodo, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { motion } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const Dashboard = () => {
  const { setup, expenses, tasks, notes, childSupport } = useAppContext();
  const today = new Date();

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
      <motion.div {...fadeIn} className="max-w-lg mx-auto text-center py-20">
        <h1 className="font-display text-3xl font-bold mb-4">Welcome to CoParent</h1>
        <p className="text-muted-foreground mb-8">
          Set up your co-parenting tracker to get started. Configure parent names, children, and preferences.
        </p>
        <Link
          to="/setup"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Get Started <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    );
  }

  const statCards = [
    {
      title: "Today",
      value: format(today, "EEEE, MMM d"),
      subtitle: format(today, "yyyy"),
      icon: CalendarDays,
      color: "text-primary",
    },
    {
      title: "Pending Tasks",
      value: pendingTasks.toString(),
      subtitle: `${tasks.length} total tasks`,
      icon: ListTodo,
      color: "text-warning",
    },
    {
      title: "Total Expenses",
      value: `${setup.currency}${totalExpenses.toLocaleString()}`,
      subtitle: balance > 0
        ? `${setup.parentBName} owes ${setup.currency}${Math.abs(balance).toFixed(0)}`
        : balance < 0
        ? `${setup.parentAName} owes ${setup.currency}${Math.abs(balance).toFixed(0)}`
        : "Balanced",
      icon: DollarSign,
      color: "text-success",
    },
    {
      title: "Notes",
      value: notes.length.toString(),
      subtitle: unpaidSupport > 0 ? `${unpaidSupport} unpaid support` : "All support paid",
      icon: BookOpen,
      color: "text-accent",
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <motion.div {...fadeIn}>
        <h1 className="font-display text-3xl font-bold mb-1">Dashboard</h1>
        <p className="text-muted-foreground">
          Hello, {setup.parentAName} & {setup.parentBName} — here's your overview.
        </p>
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
              <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.filter(t => t.status !== 'done').length === 0 ? (
                <p className="text-muted-foreground text-sm">No pending tasks. <Link to="/tasks" className="text-primary underline">Add one</Link></p>
              ) : (
                <div className="space-y-3">
                  {tasks.filter(t => t.status !== 'done').slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Due: {task.dueDate} · {task.assignedTo === 'A' ? setup.parentAName : task.assignedTo === 'B' ? setup.parentBName : 'Both'}
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
              <CardTitle className="text-lg">Recent Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentNotes.length === 0 ? (
                <p className="text-muted-foreground text-sm">No notes yet. <Link to="/notes" className="text-primary underline">Add one</Link></p>
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
