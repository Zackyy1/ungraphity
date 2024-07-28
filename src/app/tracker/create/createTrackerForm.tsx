"use client";

import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type FieldValues, type SubmitHandler, useForm } from "react-hook-form";
import { CirclePicker, type ColorResult } from "react-color";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import {
  useCreateTrackable,
  type UseCreateTrackableData,
} from "@/hooks/useCreateTrackable";
import fontColorContrast from "font-color-contrast";
import { z } from "zod";
import { BackButtonHeading } from "@/components/ui/backButtonHeading";

export const CreateTrackerForm = () => {
  const form = useForm();
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const createTrackable = useCreateTrackable();

  const [chosenColor, setChosenColor] = useState<ColorResult>({
    hex: "#f44336",
    hsl: { h: 0, s: 1, l: 0.5 },
    rgb: { r: 244, g: 67, b: 54 },
  });

  const formSchema = z.object({
    name: z
      .string()
      .min(1, {
        message: "Name must be at least 1 character.",
      })
      .max(64, {
        message: "Name must be at most 64 characters.",
      }),
    color: z
      .string()
      .min(1, {
        message: "Color must be at least 1 character, matching hex code.",
      })
      .max(7, {
        message: "Color must be at most 7 characters, matching hex code.",
      }),
    icon: z
      .string()
      .min(1, {
        message: "Icon must be at least 1 character.",
      })
      .max(2, {
        message: "Icon must be at most 2 characters.",
      })
      .optional(),
  });

  const onSubmit: SubmitHandler<UseCreateTrackableData> = (
    data: z.infer<typeof formSchema>,
  ) => {
    createTrackable({
      name: data.name,
      color: chosenColor.hex,
      icon: data.icon ?? "",
    });
  };

  return (
    <div className="flex flex-col">
      <BackButtonHeading
        headingProps={{
          text: "Create a new trackable",
        }}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit as SubmitHandler<FieldValues>)}
          className="w-full space-y-8"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trackable name</FormLabel>
                <FormControl>
                  <Input
                    minLength={1}
                    maxLength={64}
                    required
                    placeholder="Weight, coffee, cigarettes smoked..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Choose what you would like to track. Must be measurable.
                  Update daily.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block">Icon (Use Emoji)</FormLabel>
                <FormControl>
                  <Input maxLength={2} {...field} placeholder="🚬, ☕, 💪..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={() => (
              <FormItem>
                <FormLabel className="block">Trackable color</FormLabel>
                <FormControl>
                  <Popover open={colorPickerOpen}>
                    <PopoverTrigger
                      asChild
                      onClick={() => setColorPickerOpen(!colorPickerOpen)}
                    >
                      <Button
                        className="block"
                        type="button"
                        style={{
                          backgroundColor: chosenColor.hex,
                          color: fontColorContrast(chosenColor.hex),
                        }}
                      >
                        Open color picker
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <CirclePicker
                        onChangeComplete={(color: ColorResult) => {
                          setColorPickerOpen(false);
                          setChosenColor(color);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Create
          </Button>
        </form>
      </Form>
    </div>
  );
};
