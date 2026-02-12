# Seatly

Welcome to Seatly, a simple and elegant seat reservation application. This project allows users to select a seat, pick an available date from a calendar, and reserve their spot.

## Features

- **Interactive Seat Map**: A visual layout of seats that users can click to select.
- **Seat Statuses**: Seats are clearly marked as available, selected, or unavailable.
- **Calendar Date Picker**: Appears when a seat is selected, allowing users to choose a reservation date within the next 8 days, excluding weekends.
- **Reservation System**: Users can confirm their reservation, which updates the seat to "unavailable" and then provides an option to cancel.
- **View Reservations**: Look at reservations for other days up until 8 days up front, always locking out the weekends.
- **Customizable Icons**: Different icons can be used to represent different types of seats.
- **Git Ready**: Includes a `.gitignore` file to streamline version control.

## Tech Stack

This application is built with:

- [Next.js](https://nextjs.org/) (React Framework)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) (Component Library)
- [Lucide React](https://lucide.dev/guide/packages/lucide-react) (Icons)

## Getting Started

To get started with development, run the following command:

```bash
npm run dev
```

This will start the development server at [http://localhost:9002](http://localhost:9002).

Open `src/app/page.tsx` to see the main page and start making changes.
