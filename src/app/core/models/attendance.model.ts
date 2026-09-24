export type AttendanceStatus = "PRESENT" | "LATE" | "HALF_DAY";
export type AttendanceReviewStatus = "NONE" | "PENDING_REVIEW" | "REVIEWED";
export type CheckoutSource = "USER" | "SYSTEM";
export type CheckoutReasonType =
  | "FORGOT_TO_CHECKOUT"
  | "WORKING_IN_OFFICE"
  | "URGENT_TASK"
  | "MEETING"
  | "COMPANY_ASSIGNMENT"
  | "REQUESTED_TO_WORK_LATE"
  | "TECHNICAL_ISSUE"
  | "OTHER";

export interface CheckoutReasonOption {
  value: CheckoutReasonType;
  label: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  checkInAt: string;
  checkOutAt: string | null;
  checkInIp?: string | null;
  checkOutIp?: string | null;
  checkInLat?: number | null;
  checkInLng?: number | null;
  status: AttendanceStatus;
  leftEarly: boolean;
  reviewStatus: AttendanceReviewStatus;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
  checkoutReasonType?: CheckoutReasonType | null;
  checkoutReasonText?: string | null;
  checkoutSource?: CheckoutSource;
  user?: { id: string; firstName: string; lastName: string; email: string };
}

export interface CheckInPayload {
  lat?: number;
  lng?: number;
}

export interface CheckOutPayload {
  lat?: number;
  lng?: number;
  reasonType?: CheckoutReasonType;
  reasonText?: string;
}

export interface ReviewAttendancePayload {
  note?: string;
}
