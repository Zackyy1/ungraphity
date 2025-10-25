"use client";

import React from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateRecord } from "@/hooks/useCreateRecord";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/datePicker";

const newRecordSchema = z.object({
  value: z.number().min(0, "Value must be positive").optional(),
  date: z.date(),
});

type CreateRecordFormData = z.infer<typeof newRecordSchema>;

export const NewRecordForm = ({ trackableId, onSuccess }: { trackableId: string; onSuccess?: () => void }) => {
  const [valueInput, setValueInput] = React.useState<string>("");
  
  const form = useForm<CreateRecordFormData>({
    resolver: zodResolver(newRecordSchema),
    defaultValues: {
      value: undefined,
      date: new Date(),
    },
  });

  // Reset input when component mounts
  React.useEffect(() => {
    setValueInput("");
  }, []);

  const addRecord = useCreateRecord(() => {
    form.reset();
    setValueInput("");
    onSuccess?.();
  });

  const onSubmit = (data: CreateRecordFormData) => {
    if (!valueInput.trim()) {
      form.setError("value", { message: "Please enter a value" });
      return;
    }
    
    const numericValue = Number(valueInput);
    if (isNaN(numericValue) || numericValue < 0) {
      form.setError("value", { message: "Please enter a valid positive number" });
      return;
    }
    addRecord({ trackableId, value: numericValue, date: data.date });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-4"
      >
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Record value</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter a value"
                  autoFocus
                  value={valueInput}
                  onChange={(e) => {
                    setValueInput(e.target.value);
                    // Update form field for validation
                    const numericValue = Number(e.target.value);
                    if (!isNaN(numericValue)) {
                      field.onChange(numericValue);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <DatePicker
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => field.onChange(date ?? new Date())}
                  className="w-full rounded-md border"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit" variant="default">
          Add record
        </Button>
      </form>
    </Form>
  );
};
