"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type MinimalCalendarProps = React.ComponentProps<typeof DayPicker>

function MinimalCalendar({
  className,
  classNames,
  ...props
}: MinimalCalendarProps) {
  return (
    <DayPicker
      mode="single"
      showOutsideDays={false}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col",
        month: "space-y-2",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-base font-medium",
        nav: "hidden",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-7 font-normal text-[10px]",
        row: "flex w-full mt-1",
        cell: "h-7 w-7 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 p-0 font-normal"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 rounded-md",
        day_today: "bg-accent text-accent-foreground rounded-md",
        day_disabled: "text-muted-foreground/50",
        day_hidden: "invisible",
        ...classNames,
      }}
      formatters={{
        formatCaption: (date) => format(date, 'MMMM'),
        formatShortWeekday: (day) => day.toLocaleDateString('en-US', { weekday: 'narrow' })
      }}
      {...props}
    />
  )
}
MinimalCalendar.displayName = "MinimalCalendar"

export { MinimalCalendar }
