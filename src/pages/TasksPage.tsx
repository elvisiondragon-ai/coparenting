import { useState } from "react";
import { useAppContext, Task } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

const PRIORITY_STYLES = {
  high: 'bg-destructive/10 text-destructive border-destructive/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  low: 'bg-muted text-muted-foreground border-border',
};

const TasksPage = () => {
  const { setup, tasks, addTask, updateTask, removeTask } = useAppContext();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    assignedTo: 'both' as Task['assignedTo'],
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    priority: 'medium' as Task['priority'],
  });

  const handleAdd = () => {
    if (!form.title.trim()) { toast.error("Enter a task title"); return; }
    addTask({
      id: crypto.randomUUID(),
      title: form.title,
      assignedTo: form.assignedTo,
      dueDate: form.dueDate,
      status: 'todo',
      priority: form.priority,
    });
    setForm({ title: '', assignedTo: 'both', dueDate: format(new Date(), 'yyyy-MM-dd'), priority: 'medium' });
    setOpen(false);
    toast.success("Task added");
  };

  const columns: { key: Task['status']; label: string }[] = [
    { key: 'todo', label: 'To Do' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'done', label: 'Done' },
  ];

  const getAssigneeName = (a: Task['assignedTo']) =>
    a === 'A' ? setup.parentAName : a === 'B' ? setup.parentBName : 'Both';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Tasks</h1>
          <p className="text-muted-foreground">Manage shared to-dos and responsibilities.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Task</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Assigned To</Label>
                  <Select value={form.assignedTo} onValueChange={(v: Task['assignedTo']) => setForm(f => ({ ...f, assignedTo: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">{setup.parentAName}</SelectItem>
                      <SelectItem value="B">{setup.parentBName}</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
                <div>
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v: Task['priority']) => setForm(f => ({ ...f, priority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full">Add Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(col => (
          <motion.div key={col.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  {col.label}
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                    {tasks.filter(t => t.status === col.key).length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.filter(t => t.status === col.key).map(task => (
                  <div key={task.id} className="p-3 bg-muted/40 rounded-lg border space-y-2">
                    <div className="flex items-start justify-between">
                      <p className="font-medium text-sm">{task.title}</p>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => removeTask(task.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{getAssigneeName(task.assignedTo)}</span>
                      <span>·</span>
                      <span>{task.dueDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[task.priority]}`}>{task.priority}</span>
                      <Select value={task.status} onValueChange={(v: Task['status']) => updateTask(task.id, { status: v })}>
                        <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
                {tasks.filter(t => t.status === col.key).length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No tasks</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TasksPage;
