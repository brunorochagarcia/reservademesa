"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type MinimalCalendarProps = Omit<React.ComponentProps<typeof DayPicker>, 'mode' | 'selected' | 'onSelect'>

function MinimalCalendar({
  className,
  classNames,
  ...props
}: MinimalCalendarProps) {
  return (
    <DayPicker
      showOutsideDays={false}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col",
        month: "space-y-2",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-base font-medium",
        nav: "hidden",
        head: "hidden",
        row: "flex w-full mt-1",
        cell: "h-8 w-8 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal"
        ),
        day_today: "bg-accent text-accent-foreground rounded-md",
        day_disabled: "text-muted-foreground/10 line-through",
        day_hidden: "invisible",
        ...classNames,
      }}
      formatters={{
        formatCaption: (date) => format(date, 'MMMM'),
      }}
      {...props}
    />
  )
}
MinimalCalendar.displayName = "MinimalCalendar"

export { MinimalCalendar }
