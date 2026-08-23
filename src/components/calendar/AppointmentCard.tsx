import {
  Calendar,
  Clock,
  Bell,
  Repeat,
  Dog,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Appointment } from "../../types";
import {
  appointmentTypeColors,
  appointmentTypeLabels,
  notificationTimeLabels,
  recurrenceLabels,
} from "../../constants/labels";
import { formatLongDate, shortTime } from "../../utils/date";
import { useAuth } from "../../context/AuthContext";

export default function AppointmentCard({
  apt,
  onEdit,
  onDelete,
}: {
  apt: Appointment;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { canWrite } = useAuth();

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className={`w-12 h-12 ${appointmentTypeColors[apt.type]} rounded-xl flex items-center justify-center shrink-0`}
        >
          <Calendar size={22} className="text-gray-700" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-gray-900 text-base font-bold mb-1">
            {apt.type === "otro" && apt.custom_type_description
              ? apt.custom_type_description
              : appointmentTypeLabels[apt.type]}
          </p>
          <div className="flex items-center gap-1 mb-1">
            <Dog size={13} className="text-gray-600 shrink-0" />
            <span className="text-gray-700 text-sm">{apt.pet_name}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <div className="flex items-center gap-1">
              <Calendar size={13} className="text-gray-500" />
              <span className="text-gray-600 text-xs">
                {formatLongDate(apt.date)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={13} className="text-gray-500" />
              <span className="text-gray-600 text-xs">{shortTime(apt.time)}</span>
            </div>
          </div>
          {apt.recurrence_pattern && apt.recurrence_pattern !== "none" && (
            <div className="flex items-center gap-1 mb-1">
              <Repeat size={13} className="text-purple-600" />
              <span className="text-purple-600 text-xs">
                {recurrenceLabels[apt.recurrence_pattern]}
              </span>
            </div>
          )}
          {apt.notification_time && apt.notification_time !== "none" && (
            <div className="flex items-center gap-1 mt-1">
              <Bell size={13} className="text-blue-600" />
              <span className="text-blue-600 text-xs">
                {notificationTimeLabels[apt.notification_time]}
              </span>
            </div>
          )}
          {apt.notes && (
            <p className="text-gray-500 text-xs mt-1">{apt.notes}</p>
          )}
        </div>

        {canWrite && (
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={onEdit}
              className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
            >
              <Pencil size={15} className="text-indigo-600" />
            </button>
            <button
              onClick={onDelete}
              className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
            >
              <Trash2 size={15} className="text-red-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
