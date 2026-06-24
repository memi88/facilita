export type BookingStatus = "pending" | "approved" | "rejected";
export type NotificationStatus = "pending" | "sent" | "failed" | "cancelled";
export type NotificationType =
  | "booking_created"
  | "booking_approved"
  | "booking_rejected"
  | "booking_reminder_24h";

export type AppointmentType =
  | "initial_consultation"
  | "follow_up"
  | "strategy_session"
  | "support";

export type ServiceType = {
  id: string;
  profile_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          public_name: string;
          profession: string | null;
          phone: string | null;
          slug: string;
          calendar_email: string | null;
          google_calendar_id: string | null;
          calendar_connected: boolean;
          calendar_email_is_account_email: boolean;
          legal_consent_version: number;
          legal_consent_accepted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          public_name: string;
          profession?: string | null;
          phone?: string | null;
          slug: string;
          calendar_email?: string | null;
          google_calendar_id?: string | null;
          calendar_connected?: boolean;
          calendar_email_is_account_email?: boolean;
          legal_consent_version?: number;
          legal_consent_accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string | null;
          name?: string;
          public_name?: string;
          profession?: string | null;
          phone?: string | null;
          slug?: string;
          calendar_email?: string | null;
          google_calendar_id?: string | null;
          calendar_connected?: boolean;
          calendar_email_is_account_email?: boolean;
          legal_consent_version?: number;
          legal_consent_accepted_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      booking_requests: {
        Row: {
          id: string;
          profile_id: string;
          name: string;
          phone: string;
          appointment_type: string | null;
          notes: string | null;
          date: string;
          time: string;
          status: BookingStatus;
          rejection_reason: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          google_event_id: string | null;
          google_event_link: string | null;
          service_type_id: string | null;
          service_type_name: string;
          service_type_duration_minutes: number;
          cancel_reason: string | null;
          cancelled_at: string | null;
          cancelled_by: string | null;
          reschedule_reason: string | null;
          rescheduled_at: string | null;
          rescheduled_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          name: string;
          phone: string;
          appointment_type?: string | null;
          notes?: string | null;
          date: string;
          time: string;
          status?: BookingStatus;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          google_event_id?: string | null;
          google_event_link?: string | null;
          service_type_id?: string | null;
          service_type_name: string;
          service_type_duration_minutes: number;
          cancel_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          reschedule_reason?: string | null;
          rescheduled_at?: string | null;
          rescheduled_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          profile_id?: string;
          name?: string;
          phone?: string;
          appointment_type?: string | null;
          notes?: string | null;
          date?: string;
          time?: string;
          status?: BookingStatus;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          google_event_id?: string | null;
          google_event_link?: string | null;
          service_type_id?: string | null;
          service_type_name?: string;
          service_type_duration_minutes?: number;
          cancel_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          reschedule_reason?: string | null;
          rescheduled_at?: string | null;
          rescheduled_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      availability_rules: {
        Row: {
          id: string;
          profile_id: string;
          day_of_week: number;
          enabled: boolean;
          slots: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          day_of_week: number;
          enabled?: boolean;
          slots?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          day_of_week?: number;
          enabled?: boolean;
          slots?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
      availability_date_blocks: {
        Row: {
          id: string;
          profile_id: string;
          date: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          date: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          profile_id?: string;
          date?: string;
          reason?: string | null;
        };
        Relationships: [];
      };
      booking_notifications: {
        Row: {
          id: string;
          booking_request_id: string;
          channel: "whatsapp";
          type: NotificationType;
          status: NotificationStatus;
          recipient_phone: string;
          scheduled_for: string;
          sent_at: string | null;
          provider_message_id: string | null;
          payload: Record<string, unknown>;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_request_id: string;
          channel?: "whatsapp";
          type: NotificationType;
          status?: NotificationStatus;
          recipient_phone: string;
          scheduled_for?: string;
          sent_at?: string | null;
          provider_message_id?: string | null;
          payload?: Record<string, unknown>;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          channel?: "whatsapp";
          type?: NotificationType;
          status?: NotificationStatus;
          recipient_phone?: string;
          scheduled_for?: string;
          sent_at?: string | null;
          provider_message_id?: string | null;
          payload?: Record<string, unknown>;
          error_message?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      google_calendar_connections: {
        Row: {
          id: string;
          profile_id: string;
          label: string;
          google_email: string | null;
          calendar_id: string;
          access_token: string | null;
          refresh_token: string | null;
          token_expires_at: string | null;
          scope: string | null;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          label?: string;
          google_email?: string | null;
          calendar_id?: string;
          access_token?: string | null;
          refresh_token?: string | null;
          token_expires_at?: string | null;
          scope?: string | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          label?: string;
          google_email?: string | null;
          calendar_id?: string;
          access_token?: string | null;
          refresh_token?: string | null;
          token_expires_at?: string | null;
          scope?: string | null;
          is_primary?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      service_types: {
        Row: ServiceType;
        Insert: {
          id?: string;
          profile_id: string;
          name: string;
          description?: string | null;
          duration_minutes: number;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          profile_id?: string;
          name?: string;
          description?: string | null;
          duration_minutes?: number;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type BookingRequest =
  Database["public"]["Tables"]["booking_requests"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type AvailabilityRule =
  Database["public"]["Tables"]["availability_rules"]["Row"];
export type AvailabilityDateBlock =
  Database["public"]["Tables"]["availability_date_blocks"]["Row"];
export type BookingNotification =
  Database["public"]["Tables"]["booking_notifications"]["Row"];
export type GoogleCalendarConnection =
  Database["public"]["Tables"]["google_calendar_connections"]["Row"];
export type ServiceTypeRow = Database["public"]["Tables"]["service_types"]["Row"];
