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

type CreateRecordFormData = { value: number };

export const NewRecordForm = ({ trackableId }: { trackableId: string }) => {
  const form = useForm();
  const addRecord = useCreateRecord(() => form.reset());

  const newRecordSchema = z.object({
    value: z.number(),
  });
  const onSubmit: SubmitHandler<CreateRecordFormData> = (
    data: z.infer<typeof newRecordSchema>,
  ) => {
    addRecord(trackableId, data.value);
  };

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
        <DialogClose asChild>
          <Button className="w-full" type="submit" variant="default">
            Add record
          </Button>
        </DialogClose>
      </form>
    </Form>
  );
};
