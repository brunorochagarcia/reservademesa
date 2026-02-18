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
      weekStartsOn={0}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col",
        month: "space-y-2",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-base font-medium",
        nav: "hidden",
        weekdays: "hidden",
        month_grid: "w-full border-collapse",
        week: "flex w-full mt-1",
        day: "h-7 w-7 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 p-0 font-normal"
        ),
        selected:
          "bg-primary text-primary-foreground rounded-md [&>button]:hover:bg-primary/90 [&>button]:hover:text-primary-foreground",
        today: "bg-accent text-accent-foreground rounded-md",
        disabled: "text-muted-foreground/20",
        hidden: "invisible",
        ...classNames,
      }}
      formatters={{
        formatMonthCaption: (date) => format(date, 'MMMM'),
      }}
      {...props}
    />
  )
}
MinimalCalendar.displayName = "MinimalCalendar"

export { MinimalCalendar }
