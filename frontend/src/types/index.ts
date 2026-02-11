// Auth & user
export interface User {
  id: string;
  email: string;
  role: string;
  fullName?: string;
  workspace: { id: string; name: string; status: string };
  permissions: Record<string, boolean>;
}

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName?: string;
  workspaceName: string;
  address?: string;
  timezone?: string;
}

// Dashboard nav
export interface NavCounts {
  inbox: number;
  bookings: number;
}

// Dashboard data
export interface DashboardData {
  bookings: {
    today: DashboardBooking[];
    upcoming: DashboardBooking[];
    completedToday: number;
    noShowToday: number;
  };
  conversations: { openCount: number };
  forms: { pending: number; overdue: number; completed: number };
  inventory: {
    lowStock: { id: string; name: string; quantity_available: number; low_stock_threshold: number }[];
  };
  alerts: { id: string; type: string; title: string; message?: string; link_type?: string; link_id?: string }[];
}

export interface DashboardBooking {
  id: string;
  scheduled_at: string;
  contact_name: string;
  booking_type_name: string;
}

// Bookings
export interface Booking {
  id: string;
  scheduled_at: string;
  status: string;
  contact_name: string;
  booking_type_name: string;
  duration_minutes: number;
}

// Inbox
export interface Conversation {
  id: string;
  contact_id: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  last_message: string;
  last_message_at: string;
  status: string;
  has_unread?: boolean;
}

export interface Message {
  id: string;
  direction: string;
  channel: string;
  body: string;
  subject: string | null;
  is_automated: boolean;
  created_at: string;
}

// Forms
export interface Submission {
  id: string;
  status: string;
  contact_name: string;
  form_name: string;
  booking_scheduled_at: string;
  completed_at: string | null;
}

// Inventory
export interface Item {
  id: string;
  name: string;
  quantity_available: number;
  low_stock_threshold: number;
  unit: string;
}

// Settings
export interface StaffMember {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  joined_at: string | null;
}

// Public pages
export interface BookingType {
  id: string;
  name: string;
  duration_minutes: number;
  location: string | null;
  is_online: boolean;
}

export interface PublicBookPageData {
  workspaceId: string;
  workspaceName: string;
  bookingTypes: BookingType[];
}

export interface FormConfig {
  workspaceId: string;
  workspaceName: string;
  formName: string;
  fields: { name: string; type: string; label?: string }[];
}
