
import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeletePageDialogProps {
  onDelete: (password: string) => void;
  trigger: React.ReactNode;
}

export function DeletePageDialog({ onDelete, trigger }: DeletePageDialogProps) {
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    if (!password) {
      setError("Please enter password");
      return;
    }
    onDelete(password);
    setOpen(false);
    setPassword("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Page Deletion</DialogTitle>
          <DialogDescription>
            Please enter password to permanently delete this page.
          </DialogDescription>
        </DialogHeader>
        <input
          className="w-full border rounded px-3 py-2 mt-2"
          type="password"
          value={password}
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
        />
        {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
        <DialogFooter>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
