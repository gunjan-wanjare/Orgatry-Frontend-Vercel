import { useEffect, useMemo, useState } from "react";
import { addMonths, format, getDay, isSameDay, startOfMonth, subMonths } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, ChevronLeft, ChevronRight, Plus, RefreshCw, Send, XCircle } from "lucide-react";
import { PageTransition } from "@/components/animations/PageTransition";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/shared/SectionCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { permissions } from "@/constants/permissions";
import { usePermissions } from "@/hooks/use-permissions";
import {
  type CalendarResponse,
  type LeaveBalance,
  type LeaveRequest,
  useApplyLeaveMutation,
  useCancelLeaveMutation,
  useLeaveBalances,
  useLeaveCalendar,
  useLeaveRequests,
  useLeaveTypes,
  useReviewLeaveMutation,
} from "./useLeaves";

const localDateString = (value: Date) =>
  value.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" }).split("/").reverse().join("-");
const formatReadableDate = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
const daysInMonth = (year: number, monthIndex: number) => new Date(year, monthIndex + 1, 0).getDate();

function LeaveBalanceCards({ balances }: { balances: LeaveBalance[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {balances.map((balance) => {
        const remaining = balance.remaining ?? Number(balance.allocated) - Number(balance.used);
        const percent = balance.allocated > 0 ? Math.max(0, Math.min(100, (remaining / Number(balance.allocated)) * 100)) : 0;

        return (
          <Card key={balance.leaveTypeId} className="border-border bg-white/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{balance.leaveType.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end justify-between">
                <span className="text-sm text-muted-foreground">Remaining</span>
                <span className="text-lg font-semibold text-emerald-300">{remaining.toFixed(1)} days</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: `${percent}%` }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Allocated: {Number(balance.allocated).toFixed(1)}</span>
                <span>Used: {Number(balance.used).toFixed(1)}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function LeaveCalendarGrid({
  monthDate,
  calendar,
  onPrevMonth,
  onNextMonth,
  showEmployeeNames = false,
}: {
  monthDate: Date;
  calendar: CalendarResponse | undefined;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  showEmployeeNames?: boolean;
}) {
  const year = monthDate.getFullYear();
  const monthIndex = monthDate.getMonth();
  const startDay = getDay(startOfMonth(monthDate));
  const totalDays = daysInMonth(year, monthIndex);
  const cells = Array.from({ length: 42 }, (_, index) => index - startDay + 1);

  const isWeekend = (date: Date) => calendar?.weekends.some((day) => isSameDay(new Date(day), date)) ?? false;
  const holidayForDay = (date: Date) =>
    [...(calendar?.holidays ?? []), ...(calendar?.optionalHolidays ?? [])].find((holiday) => isSameDay(new Date(holiday.date), date));
  const leavesForDay = (date: Date) =>
    (calendar?.leaves ?? []).filter(
      (leave) =>
        isSameDay(new Date(leave.startDate), date) ||
        (new Date(leave.startDate) <= date && date <= new Date(leave.endDate)),
    );

  return (
    <div className="rounded-2xl border border-border bg-white/[0.02] p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onPrevMonth}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-lg font-semibold">{format(monthDate, "MMMM yyyy")}</span>
          <Button variant="outline" size="icon" onClick={onNextMonth}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="bg-slate-500/10 text-slate-300">Weekend</Badge>
          <Badge className="bg-yellow-500/10 text-yellow-200">Holiday</Badge>
          <Badge className="bg-orange-500/10 text-orange-300">Pending Leave</Badge>
          <Badge className="bg-blue-500/10 text-blue-300">Approved Leave</Badge>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="px-2 py-1 text-center text-xs font-medium text-muted-foreground">{day}</div>
        ))}
        {cells.map((dayNumber, index) => {
          if (dayNumber < 1 || dayNumber > totalDays) {
            return <div key={index} className="min-h-24 rounded-xl border border-border/50 bg-white/[0.01]" />;
          }

          const date = new Date(year, monthIndex, dayNumber);
          const weekend = isWeekend(date);
          const holiday = holidayForDay(date);
          const dayLeaves = leavesForDay(date);
          const isToday = isSameDay(date, new Date());

          return (
            <div
              key={date.toISOString()}
              className={`min-h-24 rounded-xl border p-2 text-left ${isToday ? "border-cyan-500/50" : "border-border/50"} ${weekend ? "bg-slate-500/15" : "bg-white/[0.015]"} ${holiday?.type === "OPTIONAL" ? "ring-1 ring-yellow-500/30" : ""}`}
            >
              <div className="flex items-start justify-between">
                <span className={`text-sm ${isToday ? "font-semibold text-cyan-300" : "text-foreground"}`}>{dayNumber}</span>
              </div>
              <div className="mt-2 space-y-1">
                {holiday ? (
                  <div className={`rounded-md px-2 py-1 text-xs ${holiday.type === "OPTIONAL" ? "bg-yellow-500/15 text-yellow-200" : "bg-yellow-500/20 text-yellow-100"}`}>
                    {holiday.name}
                  </div>
                ) : null}
                {dayLeaves.map((leave) => (
                  <div
                    key={leave.id}
                    className={`rounded-md px-2 py-1 text-xs ${leave.status === "APPROVED" ? "bg-blue-500/15 text-blue-200" : "bg-orange-500/15 text-orange-200"}`}
                  >
                    {showEmployeeNames && leave.employee
                      ? `${leave.employee.firstName} · ${leave.leaveType.name}`
                      : leave.leaveType.name}
                  </div>
                ))}
                {weekend && !holiday ? <div className="text-xs text-slate-400">Weekend</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LeavesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { can } = usePermissions();
  const canApproveLeaves = can(permissions.leaveApprove);
  const canApply = can(permissions.leaveWrite);

  const initialTab = searchParams.get("tab") ?? (searchParams.get("status") === "pending" ? "approvals" : "my-leaves");
  const [activeTab, setActiveTab] = useState(initialTab);
  const [applyOpen, setApplyOpen] = useState(false);
  const [decisionDialogOpen, setDecisionDialogOpen] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [teamCalendarMonth, setTeamCalendarMonth] = useState(new Date());
  const [teamOnly, setTeamOnly] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [decision, setDecision] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [remarks, setRemarks] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);
  const [overlapWarning, setOverlapWarning] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("status") === "pending" && canApproveLeaves) {
      setActiveTab("approvals");
    }
  }, [canApproveLeaves, searchParams]);

  const { data: leaveTypes } = useLeaveTypes();
  const { data: balances } = useLeaveBalances();
  const { data: requests, refetch: refetchRequests } = useLeaveRequests("mine");
  const { data: pendingApprovals, isLoading: pendingLoading, refetch: refetchPending } = useLeaveRequests("pending");
  const { data: calendar, isLoading: calendarLoading } = useLeaveCalendar(calendarMonth, false);
  const { data: teamCalendar, isLoading: teamCalendarLoading } = useLeaveCalendar(teamCalendarMonth, teamOnly);

  const applyMutation = useApplyLeaveMutation();
  const reviewMutation = useReviewLeaveMutation();
  const cancelMutation = useCancelLeaveMutation();

  const approveCount = pendingApprovals?.length ?? 0;

  const remainingForSelectedType = useMemo(() => {
    const balance = balances?.find((item) => item.leaveTypeId === selectedLeaveType);
    if (!balance) return null;
    return balance.remaining ?? Number(balance.allocated) - Number(balance.used);
  }, [balances, selectedLeaveType]);

  const selectedWorkingDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return 0;

    let total = 0;
    const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const holidaySet = new Set([...(calendar?.holidays ?? []), ...(calendar?.optionalHolidays ?? [])].map((holiday) => holiday.date.slice(0, 10)));
    const weekendSet = new Set((calendar?.weekends ?? []).map((day) => day.slice(0, 10)));

    while (cursor <= end) {
      const dayKey = localDateString(cursor);
      if (!holidaySet.has(dayKey) && !weekendSet.has(dayKey)) {
        total += 1;
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    return total;
  }, [calendar, endDate, startDate]);

  const approvalHistory = useMemo(
    () => (requests ?? []).filter((request) => request.status !== "PENDING"),
    [requests],
  );

  const validateSelectedDates = (nextStart: string, nextEnd: string) => {
    if (!nextStart || !nextEnd || !calendar) {
      setDateError(null);
      setOverlapWarning(null);
      return;
    }

    const start = new Date(nextStart);
    const end = new Date(nextEnd);
    if (start > end) {
      setDateError("Start date must be before end date");
      return;
    }

    const daySet = new Set(calendar.weekends.map((value) => value.slice(0, 10)));
    const holidaySet = new Set([...calendar.holidays, ...calendar.optionalHolidays].map((holiday) => holiday.date.slice(0, 10)));
    const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());

    while (cursor <= end) {
      const key = localDateString(cursor);
      if (daySet.has(key)) {
        setDateError("Selected range includes a weekend");
        return;
      }
      if (holidaySet.has(key)) {
        setDateError("Selected range includes a holiday");
        return;
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    const overlapping = requests?.find((request) => {
      const requestStart = new Date(request.startDate);
      const requestEnd = new Date(request.endDate);
      return (request.status === "PENDING" || request.status === "APPROVED") && requestStart <= end && requestEnd >= start;
    });

    setDateError(null);
    setOverlapWarning(overlapping ? "An overlapping leave request already exists" : null);
  };

  const selectedDatesValid = !dateError && !overlapWarning && Boolean(selectedLeaveType && startDate && endDate);
  const canCancelLeave = (request: LeaveRequest) => {
    if (request.status !== "APPROVED") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(request.startDate) >= today;
  };

  const openDecisionDialog = (request: LeaveRequest, nextDecision: "APPROVED" | "REJECTED") => {
    setSelectedRequest(request);
    setDecision(nextDecision);
    setRemarks("");
    setDecisionDialogOpen(true);
  };

  const submitDecision = () => {
    if (!selectedRequest) return;
    if (decision === "REJECTED" && !remarks.trim()) return;

    reviewMutation.mutate({
      id: selectedRequest.id,
      decision,
      ...(remarks.trim() ? { remarks: remarks.trim() } : {}),
    }, {
      onSuccess: () => {
        setDecisionDialogOpen(false);
        setSelectedRequest(null);
        setRemarks("");
        void refetchPending();
      },
    });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams(value === "approvals" ? { tab: "approvals", status: "pending" } : { tab: value });
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Leave Management"
          title="Leaves"
          description="Apply for leave, review team approvals, and browse calendars with holidays and weekends"
          actions={
            <>
              {canApproveLeaves && approveCount > 0 ? (
                <Badge className="mr-2 bg-amber-500/10 text-amber-300">{approveCount} pending</Badge>
              ) : null}
              {canApply ? (
                <Button onClick={() => setApplyOpen(true)}>
                  <Plus className="mr-2 size-4" />
                  Apply Leave
                </Button>
              ) : null}
            </>
          }
        />

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="my-leaves">My Leaves</TabsTrigger>
            {canApproveLeaves ? <TabsTrigger value="approvals">Approvals</TabsTrigger> : null}
            <TabsTrigger value="calendar">My Calendar</TabsTrigger>
            {canApproveLeaves ? <TabsTrigger value="team-calendar">Team Calendar</TabsTrigger> : null}
          </TabsList>

          <TabsContent value="my-leaves" className="space-y-6">
            {balances?.length ? <LeaveBalanceCards balances={balances} /> : null}

            <SectionCard title="Leave Requests" description="Your leave history and decision status">
              {requests?.length ? (
                <div className="divide-y divide-border">
                  {requests.map((request) => (
                    <div key={request.id} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{request.leaveType.name}</span>
                          <Badge variant={request.status === "APPROVED" ? "success" : request.status === "REJECTED" ? "destructive" : request.status === "CANCELLED" ? "outline" : "warning"}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatReadableDate(request.startDate)} - {formatReadableDate(request.endDate)} ({request.days} day{request.days === 1 ? "" : "s"})
                        </p>
                        {request.reason ? <p className="mt-1 text-sm">{request.reason}</p> : null}
                      </div>
                      <div className="flex flex-col items-end gap-2 text-right text-xs text-muted-foreground">
                        {request.approvals?.map((approval) => (
                          <div key={approval.level}>
                            Level {approval.level}: {approval.decision}
                          </div>
                        ))}
                        {canCancelLeave(request) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={cancelMutation.isPending}
                            onClick={() => cancelMutation.mutate(request.id)}
                          >
                            Cancel Leave
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                  <Send className="mx-auto mb-3 size-8 text-muted-foreground" />
                  <p className="text-muted-foreground">No leave requests yet</p>
                </div>
              )}
            </SectionCard>
          </TabsContent>

          {canApproveLeaves ? (
            <TabsContent value="approvals" className="space-y-4">
              <Tabs defaultValue="pending">
                <TabsList>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                  <SectionCard
                    title="Pending Leave Requests"
                    description="Approve or reject requests from your direct reports"
                    actions={
                      <Button variant="outline" size="sm" onClick={() => void refetchPending()}>
                        <RefreshCw className="mr-2 size-4" />
                        Refresh
                      </Button>
                    }
                  >
                    {pendingLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }, (_, index) => (
                          <div key={index} className="h-24 animate-pulse rounded-xl bg-white/[0.04]" />
                        ))}
                      </div>
                    ) : pendingApprovals?.length ? (
                      <div className="divide-y divide-border">
                        {pendingApprovals.map((request) => (
                          <div key={request.id} className="flex flex-wrap items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium">{request.employee?.firstName} {request.employee?.lastName}</span>
                                <span className="text-sm text-muted-foreground">({request.employee?.employeeId})</span>
                                <Badge variant="outline">{request.employee?.department}</Badge>
                                <Badge variant="secondary">{request.leaveType.name}</Badge>
                                <Badge className="bg-orange-500/10 text-orange-300">PENDING</Badge>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {format(new Date(request.startDate), "PPP")} - {format(new Date(request.endDate), "PPP")} ({request.days} day{request.days === 1 ? "" : "s"})
                              </p>
                              {request.reason ? <p className="mt-1 text-sm">Reason: {request.reason}</p> : null}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-500" onClick={() => openDecisionDialog(request, "APPROVED")}>
                                <CheckCircle className="mr-1 size-4" />
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => openDecisionDialog(request, "REJECTED")}>
                                <XCircle className="mr-1 size-4" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border p-8 text-center">
                        <p className="text-muted-foreground">No pending leave requests</p>
                      </div>
                    )}
                  </SectionCard>
                </TabsContent>

                <TabsContent value="history">
                  <SectionCard title="Approval History" description="Previously reviewed leave requests">
                    {approvalHistory.length ? (
                      <div className="divide-y divide-border">
                        {approvalHistory.map((request) => (
                          <div key={request.id} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium">{request.employee?.firstName ?? "Employee"} {request.employee?.lastName ?? ""}</span>
                                {request.employee?.department ? <Badge variant="outline">{request.employee.department}</Badge> : null}
                                <Badge variant="secondary">{request.leaveType.name}</Badge>
                                <Badge variant={request.status === "APPROVED" ? "success" : request.status === "REJECTED" ? "destructive" : "outline"}>{request.status}</Badge>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {format(new Date(request.startDate), "PPP")} - {format(new Date(request.endDate), "PPP")} ({request.days} day{request.days === 1 ? "" : "s"})
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border p-8 text-center">
                        <p className="text-muted-foreground">No approval history yet</p>
                      </div>
                    )}
                  </SectionCard>
                </TabsContent>
              </Tabs>
            </TabsContent>
          ) : null}

          <TabsContent value="calendar">
            {calendarLoading ? (
              <div className="h-96 animate-pulse rounded-2xl bg-white/[0.04]" />
            ) : (
              <LeaveCalendarGrid
                monthDate={calendarMonth}
                calendar={calendar}
                onPrevMonth={() => setCalendarMonth((value) => subMonths(value, 1))}
                onNextMonth={() => setCalendarMonth((value) => addMonths(value, 1))}
              />
            )}
          </TabsContent>

          {canApproveLeaves ? (
            <TabsContent value="team-calendar" className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-white/[0.02] px-4 py-3">
                <Switch checked={teamOnly} onCheckedChange={setTeamOnly} id="team-only" />
                <Label htmlFor="team-only">My Team Only</Label>
              </div>
              {teamCalendarLoading ? (
                <div className="h-96 animate-pulse rounded-2xl bg-white/[0.04]" />
              ) : (
                <LeaveCalendarGrid
                  monthDate={teamCalendarMonth}
                  calendar={teamCalendar}
                  showEmployeeNames
                  onPrevMonth={() => setTeamCalendarMonth((value) => subMonths(value, 1))}
                  onNextMonth={() => setTeamCalendarMonth((value) => addMonths(value, 1))}
                />
              )}
            </TabsContent>
          ) : null}
        </Tabs>

        <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply for leave</DialogTitle>
              <DialogDescription>Balance-aware validation runs before submission. Same-day leave must be applied 1 hour before office start.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Leave Type</Label>
                <Select value={selectedLeaveType} onValueChange={setSelectedLeaveType}>
                  <SelectTrigger><SelectValue placeholder="Select leave type" /></SelectTrigger>
                  <SelectContent>
                    {leaveTypes?.map((type) => (
                      <SelectItem key={type.id} value={type.id}>{type.name} ({Number(type.annualQuota).toFixed(1)} days)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {remainingForSelectedType !== null ? (
                  <p className="mt-1 text-xs text-muted-foreground">Remaining balance: {remainingForSelectedType.toFixed(1)} days</p>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Start Date</Label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={startDate}
                    onChange={(event) => {
                      setStartDate(event.target.value);
                      validateSelectedDates(event.target.value, endDate);
                    }}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={endDate}
                    onChange={(event) => {
                      setEndDate(event.target.value);
                      validateSelectedDates(startDate, event.target.value);
                    }}
                  />
                </div>
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <p>Estimated working days: {selectedWorkingDays}</p>
                {dateError ? <p className="text-red-300">{dateError}</p> : null}
                {overlapWarning ? <p className="text-amber-300">{overlapWarning}</p> : null}
              </div>
              <div>
                <Label>Reason</Label>
                <Textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} placeholder="Optional context for the leave request" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApplyOpen(false)}>Cancel</Button>
              <Button
                onClick={() =>
                  applyMutation.mutate(
                    {
                      leaveTypeId: selectedLeaveType,
                      startDate,
                      endDate,
                      ...(reason.trim() ? { reason: reason.trim() } : {}),
                    },
                    {
                      onSuccess: () => {
                        setApplyOpen(false);
                        setSelectedLeaveType("");
                        setStartDate("");
                        setEndDate("");
                        setReason("");
                        setDateError(null);
                        setOverlapWarning(null);
                        void refetchRequests();
                      },
                    },
                  )
                }
                disabled={
                  !selectedDatesValid ||
                  applyMutation.isPending ||
                  (remainingForSelectedType !== null && remainingForSelectedType < selectedWorkingDays)
                }
              >
                {applyMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={decisionDialogOpen} onOpenChange={setDecisionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{decision === "APPROVED" ? "Approve leave request" : "Reject leave request"}</DialogTitle>
              <DialogDescription>
                {decision === "APPROVED"
                  ? "Approve this request with an optional comment."
                  : "Reject this request with a required reason."}
              </DialogDescription>
            </DialogHeader>
            {selectedRequest ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-border/50 bg-white/[0.03] p-4 text-sm">
                  <div className="font-medium">{selectedRequest.employee?.firstName} {selectedRequest.employee?.lastName}</div>
                  <div className="text-muted-foreground">{selectedRequest.leaveType.name}</div>
                  <div className="text-muted-foreground">{format(new Date(selectedRequest.startDate), "PPP")} - {format(new Date(selectedRequest.endDate), "PPP")}</div>
                </div>
                <div className="grid gap-2">
                  <Label>{decision === "APPROVED" ? "Comment (optional)" : "Reason (required)"}</Label>
                  <Textarea value={remarks} onChange={(event) => setRemarks(event.target.value)} rows={4} placeholder={decision === "APPROVED" ? "Optional comment" : "Explain the rejection reason"} />
                </div>
              </div>
            ) : null}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDecisionDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={submitDecision}
                disabled={reviewMutation.isPending || (decision === "REJECTED" && !remarks.trim())}
                className={decision === "APPROVED" ? "bg-emerald-600 text-white hover:bg-emerald-500" : undefined}
              >
                {reviewMutation.isPending ? "Saving..." : decision === "APPROVED" ? "Approve" : "Reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
