import type { Appointment, Medication, Exercise, Care } from "../../types";

export type AppointmentEvent = {
  type: "appointment";
  id: string;
  petName: string;
  time: string;
  data: Appointment;
};

export type MedicationEvent = {
  type: "medication";
  id: string;
  petName: string;
  time: string;
  medicationId: string;
  scheduledTime: string;
  data: Medication;
};

export type ExerciseEvent = {
  type: "exercise";
  id: string;
  petName: string;
  time: string;
  exerciseId: string;
  scheduledTime: string;
  data: Exercise;
};

export type CareEvent = {
  type: "care";
  id: string;
  petName: string;
  time: string;
  careId: string;
  scheduledTime: string;
  data: Care;
};

export type HomeEvent =
  | AppointmentEvent
  | MedicationEvent
  | ExerciseEvent
  | CareEvent;
