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

export async function updateReservation(id: string, newDate: string) {
  return prisma.reservation.update({
    where: { id },
    data: { date: newDate },
  });
}

export async function cancelReservation(id: string) {
  return prisma.reservation.delete({
    where: { id },
  });
}
