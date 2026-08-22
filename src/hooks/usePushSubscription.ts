import { useEffect } from "react";

import * as apiClient from "../api";
import { useAuth } from "../context/AuthContext";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

/**
 * Suscribe el dispositivo a Web Push y registra la suscripción en la API.
 * Funciona en iOS Safari 16.4+ (Agregar a inicio) y Android Chrome.
 *
 * La suscripción es del dispositivo, no del grupo: el backend le manda los avisos de
 * todos los grupos a los que pertenece esta cuenta.
 */
export function usePushSubscription() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !VAPID_PUBLIC_KEY) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission !== "granted") return;

    (async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
              .buffer as ArrayBuffer,
          });
        }

        const { endpoint, keys } = subscription.toJSON() as {
          endpoint: string;
          keys: { p256dh: string; auth: string };
        };
        await apiClient.push.subscribe({
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
        });
      } catch (err) {
        // Falla silenciosa: puede que la app no esté instalada todavía.
        console.warn("[PushSubscription]", err);
      }
    })();
  }, [user]);
}
