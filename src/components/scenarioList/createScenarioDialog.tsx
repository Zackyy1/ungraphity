"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SCENARIO_COLORS, DEFAULT_SCENARIO_COLOR } from "@/lib/scenarioColors";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface CreateScenarioDialogProps {
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export const CreateScenarioDialog = ({
  onSuccess,
  children,
}: CreateScenarioDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(DEFAULT_SCENARIO_COLOR);
  const [icon, setIcon] = useState("");

  const createScenario = api.scenario.create.useMutation({
    onSuccess: () => {
      toast.success("Scenario created successfully!");
      setName("");
      setIcon("");
      setSelectedColor(DEFAULT_SCENARIO_COLOR);
      setOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to create scenario");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a scenario name");
      return;
    }
    createScenario.mutate({
      name: name.trim(),
      color: selectedColor,
      icon: icon.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? <Button>Create Scenario</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Scenario</DialogTitle>
            <DialogDescription>
              Create a container for related trackables. Choose a name and
              color.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Gym, Quit Smoking, Reading"
                maxLength={255}
                autoComplete="off"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="icon">Icon (optional)</Label>
              <Input
                id="icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="🎯"
                maxLength={2}
                autoComplete="off"
              />
            </div>

            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="grid grid-cols-6 gap-2">
                {SCENARIO_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value as typeof DEFAULT_SCENARIO_COLOR)}
                    className="group relative h-10 w-10 rounded-md border-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: `hsl(var(--${color.value}))`,
                      borderColor:
                        selectedColor === color.value
                          ? "hsl(var(--foreground))"
                          : "transparent",
                    }}
                    title={color.name}
                  >
                    {selectedColor === color.value && (
                      <div className="absolute inset-0 flex items-center justify-center text-lg">
                        ✓
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createScenario.isPending}>
              {createScenario.isPending ? "Creating..." : "Create Scenario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

