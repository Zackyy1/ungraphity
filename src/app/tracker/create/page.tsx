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
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { CirclePicker, type ColorResult } from "react-color";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export default function TrackerDefaultPage() {
  const form = useForm();
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const router = useRouter();
  const db = api.track.create.useMutation({
    onSuccess: async (data) => {
      router.push("/tracker/" + data.id);
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [chosenColor, setChosenColor] = useState<ColorResult>({
    hex: "#f44336",
    hsl: { h: 0, s: 1, l: 0.5 },
    rgb: { r: 244, g: 67, b: 54 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (data: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    db.mutate({ name: data.name, color: chosenColor.hex, icon: data.icon });
  };

  return (
    <div className="mt-8 flex flex-col items-center">
      <Heading className="mb-6 text-center">Create a new trackable</Heading>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-8 lg:max-w-80"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trackable name</FormLabel>
                <FormControl>
                  <Input
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
                        // onClick={() => setColorPickerOpen(!colorPickerOpen)}
                        className="block"
                        type="button"
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        style={{ backgroundColor: chosenColor.hex }}
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
          <Button type="submit" className="w-full">
            Create
          </Button>
        </form>
      </Form>
    </div>
  );
}
