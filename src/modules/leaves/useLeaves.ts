import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { httpClient } from '@/services/api/http-client';
import { endpoints } from '@/services/api/endpoints';
import type { ApiResponse } from '@/types/api';
import { parseApiError } from '@/lib/errors';

export type LeaveType = {
  id: string;
  name: string;
  code: string;
  annualQuota: number;
  isPaid: boolean;
};

export type LeaveBalance = {
  id: string;
  leaveTypeId: string;
  allocated: number;
  used: number;
  remaining?: number;
  leaveType: LeaveType;
};

export type LeaveRequest = {
  id: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string | null;
  status: string;
  leaveType: LeaveType;
  employee?: {
    employeeId: string;
    firstName: string;
    lastName: string;
    department: string;
    designation: string;
  };
  approvals?: Array<{
    approver?: { firstName: string; lastName: string };
    decision: string;
    level: number;
    remarks?: string | null;
  }>;
};

export type Holiday = {
  id: string;
  name: string;
  date: string;
  type: string;
  region?: string | null;
};

export type CalendarResponse = {
  holidays: Holiday[];
  optionalHolidays: Holiday[];
  weekends: string[];
  leaves: LeaveRequest[];
  month: number;
  year: number;
};

type PaginatedResponse<T> = {
  items: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export const leaveQueryKeys = {
  all: ['leave'] as const,
  types: ['leave-types'] as const,
  balances: (year?: number) => ['leave-balances', year ?? new Date().getFullYear()] as const,
  requests: (scope?: string) => ['leave-requests', scope ?? 'mine'] as const,
  pending: ['leave-requests', 'pending'] as const,
  calendar: (year: number, month: number, teamOnly?: boolean) =>
    ['leave-calendar', year, month, teamOnly ? 'team' : 'self'] as const,
};

export function invalidateLeaveQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: leaveQueryKeys.all });
  void queryClient.invalidateQueries({ queryKey: leaveQueryKeys.types });
  void queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
  void queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
  void queryClient.invalidateQueries({ queryKey: ['leave-calendar'] });
}

export function useLeaveTypes() {
  return useQuery({
    queryKey: leaveQueryKeys.types,
    queryFn: async () => {
      const res = await httpClient.get<ApiResponse<LeaveType[]>>(endpoints.leaveTypes);
      return res.data.data ?? [];
    },
  });
}

export function useLeaveBalances(year = new Date().getFullYear()) {
  return useQuery({
    queryKey: leaveQueryKeys.balances(year),
    queryFn: async () => {
      const res = await httpClient.get<ApiResponse<LeaveBalance[]>>(endpoints.leaveBalance, {
        params: { year },
      });
      return res.data.data ?? [];
    },
  });
}

export function useLeaveRequests(scope: 'mine' | 'pending' = 'mine') {
  return useQuery({
    queryKey: leaveQueryKeys.requests(scope),
    queryFn: async () => {
      const url =
        scope === 'pending'
          ? `${endpoints.leaveRequests}?status=PENDING&pendingForApproval=true&page=1&limit=50`
          : endpoints.leaveRequests;
      const res = await httpClient.get<ApiResponse<PaginatedResponse<LeaveRequest>>>(url);
      return res.data.data?.items ?? [];
    },
    staleTime: 60_000,
  });
}

export function useLeaveCalendar(monthDate: Date, teamOnly = false) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth() + 1;

  return useQuery({
    queryKey: leaveQueryKeys.calendar(year, month, teamOnly),
    queryFn: async () => {
      const res = await httpClient.get<ApiResponse<CalendarResponse>>(
        `${endpoints.leaveCalendarView}?year=${year}&month=${month}${teamOnly ? '&teamOnly=true' : ''}`,
      );
      return res.data.data;
    },
    staleTime: 60_000,
  });
}

export function useApplyLeaveMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { leaveTypeId: string; startDate: string; endDate: string; reason?: string }) => {
      const res = await httpClient.post<ApiResponse<LeaveRequest>>(endpoints.leaveApply, payload);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Leave request submitted');
      invalidateLeaveQueries(queryClient);
    },
    onError: (error: unknown) => toast.error(parseApiError(error).message),
  });
}

export function useReviewLeaveMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: string; decision: 'APPROVED' | 'REJECTED'; remarks?: string }) => {
      const res = await httpClient.patch<ApiResponse<LeaveRequest>>(
        `${endpoints.leaveRequests}/${payload.id}`,
        { decision: payload.decision, remarks: payload.remarks },
      );
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      toast.success(
        variables.decision === 'APPROVED' ? 'Leave request approved' : 'Leave request rejected',
      );
      invalidateLeaveQueries(queryClient);
    },
    onError: (error: unknown) => toast.error(parseApiError(error).message),
  });
}

export function useCancelLeaveMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await httpClient.post<ApiResponse<LeaveRequest>>(`${endpoints.leaveRequests}/${id}/cancel`);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Leave request cancelled');
      invalidateLeaveQueries(queryClient);
    },
    onError: (error: unknown) => toast.error(parseApiError(error).message),
  });
}
