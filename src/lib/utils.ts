import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const checkPaymentStatus = () => {
  const dueDate = new Date("2025-02-15"); // Update with your due date
  const daysDeadline = 60;

  const currentDate = new Date();
  const utc1 = Date.UTC(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate()
  );
  const utc2 = Date.UTC(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );
  const days = Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));

  if (days > 0) {
    const daysLate = daysDeadline - days;
    let opacity = (daysLate * 100) / daysDeadline / 100;
    opacity = Math.max(0, Math.min(1, opacity));

    if (opacity >= 0 && opacity <= 1) {
      document.body.style.opacity = opacity.toString();
    }
  }
};

export const formatCertificateNumber = (number: number | string) => {
  // Ensure the number is padded to a minimum of 6 digits
  return `P-${String(number).padStart(6, "0")}`;
};

export const getOriginalCertificateNumber = (certificateNo: string) => {
  return Number(certificateNo.replace("P-", ""));
};
