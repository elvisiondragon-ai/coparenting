import { useState } from "react";
import { useAppContext, Note } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

const NotesPage = () => {
  const { setup, notes, addNote, removeNote } = useAppContext();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    content: '',
    author: 'A' as 'A' | 'B',
    tags: '',
  });

  const handleAdd = () => {
    if (!form.content.trim()) { toast.error("Write something"); return; }
    addNote({
      id: crypto.randomUUID(),
      date: format(new Date(), 'yyyy-MM-dd HH:mm'),
      author: form.author,
      content: form.content,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    setForm({ content: '', author: 'A', tags: '' });
    setOpen(false);
    toast.success("Note added");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Notes & Reflections</h1>
          <p className="text-muted-foreground">Shared journal for updates about your children.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Note</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Note</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Author</Label>
                <Select value={form.author} onValueChange={(v: 'A' | 'B') => setForm(f => ({ ...f, author: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">{setup.parentAName}</SelectItem>
                    <SelectItem value="B">{setup.parentBName}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Note</Label>
                <Textarea rows={5} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="How was the child's day? Any health updates, milestones..." />
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <input className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="health, school, milestone" />
              </div>
              <Button onClick={handleAdd} className="w-full">Add Note</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="space-y-4">
        {notes.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No notes yet. Start documenting important moments.</CardContent></Card>
        ) : (
          [...notes].reverse().map(note => (
            <motion.div key={note.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${note.author === 'A' ? 'parent-a-bg' : 'parent-b-bg'}`} />
                      <span className="font-medium text-sm">
                        {note.author === 'A' ? setup.parentAName : setup.parentBName}
                      </span>
                      <span className="text-xs text-muted-foreground">{note.date}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeNote(note.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {note.tags.map(tag => (
                        <span key={tag} className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-xs">#{tag}</span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesPage;
