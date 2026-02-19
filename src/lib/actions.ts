"use server";

import { prisma } from "@/lib/prisma";

export async function getReservations(date: string) {
  return prisma.reservation.findMany({
    where: { date },
  });
}

export async function createReservation(seatId: string, date: string) {
  return prisma.reservation.create({
    data: { seatId, date },
  });
}
