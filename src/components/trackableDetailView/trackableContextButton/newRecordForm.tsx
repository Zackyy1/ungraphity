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
import { DialogClose } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { useForm, type FieldValues, type SubmitHandler } from "react-hook-form";
import { useCreateRecord } from "@/hooks/useCreateRecord";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/datePicker";

type CreateRecordFormData = { value: number; date: Date };

export const NewRecordForm = ({ trackableId }: { trackableId: string }) => {
  const form = useForm();
  const addRecord = useCreateRecord(() => form.reset());
  const [date, setDate] = React.useState<Date>(new Date());

  const newRecordSchema = z.object({
    value: z.number(),
    date: z.date(),
  });

  const onSubmit: SubmitHandler<CreateRecordFormData> = (
    data: z.infer<typeof newRecordSchema>,
  ) => addRecord({ trackableId, value: data.value, date });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit as SubmitHandler<FieldValues>)}
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
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DatePicker
          mode="single"
          selected={new Date()}
          onSelect={(date) => setDate(date ?? new Date())}
          className="w-full rounded-md border"
        />
        <DialogClose asChild>
          <Button className="w-full" type="submit" variant="default">
            Add record
          </Button>
        </DialogClose>
      </form>
    </Form>
  );
};
