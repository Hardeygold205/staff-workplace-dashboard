import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CalendarService } from "../../core/services/calendar.service";
import { EventsService } from "../../core/services/events.service";
import { AttendanceService } from "../../core/services/attendance.service";
import { UsersService } from "../../core/services/users.service";
import { CalendarItem } from "../../core/models/calendar.model";
import { CompanyEvent } from "../../core/models/event.model";
import { AttendanceRecord } from "../../core/models/attendance.model";
import { PageHeaderComponent } from "../../shared/ui/page-header/page-header.component";
import { CardComponent } from "../../shared/ui/card/card.component";
import { ButtonComponent } from "../../shared/ui/button/button.component";
import { SpinnerComponent } from "../../shared/ui/spinner/spinner.component";

const WAT_TZ = "Africa/Lagos";
type DayStatus =
  | "WEEKEND"
  | "PRESENT"
  | "LATE"
  | "HALF_DAY"
  | "LEAVE"
  | "ABSENT"
  | "PENDING"
  | "UPCOMING"
  | "EXEMPT";

interface DayCell {
  day: number;
  date: Date;
  dateKey: string;
  isWeekend: boolean;
  status: DayStatus;
  events: CompanyEvent[];
  items: CalendarItem[];
}

function watDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: WAT_TZ }).format(date);
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function expandDateRange(startIso: string, endIso: string): string[] {
  const keys: string[] = [];
  const cursor = new Date(watDateKey(new Date(startIso)) + "T00:00:00");
  const endKey = watDateKey(new Date(endIso));
  let guard = 0;
  while (guard++ < 366) {
    const key = watDateKey(cursor);
    keys.push(key);
    if (key >= endKey) break;
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

@Component({
  selector: "app-calendar",
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    CardComponent,
    ButtonComponent,
    SpinnerComponent,
  ],
  templateUrl: "./calendar.component.html",
})
export class CalendarComponent implements OnInit {
  private calendarService = inject(CalendarService);
  private eventsService = inject(EventsService);
  private attendanceService = inject(AttendanceService);
  private usersService = inject(UsersService);

  isExempt = signal(false);

  loading = signal(true);
  cursor = signal(new Date());
  workingDays = signal<Set<string>>(new Set());
  itemsByDay = signal<Map<string, CalendarItem[]>>(new Map());
  attendanceByDay = signal<Map<string, AttendanceRecord>>(new Map());
  upcoming = signal<CompanyEvent[]>([]);

  monthLabel = computed(() =>
    this.cursor().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: WAT_TZ,
    }),
  );

  cells = computed<(DayCell | null)[]>(() => {
    const year = this.cursor().getFullYear();
    const month = this.cursor().getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = new Date(year, month, 1).getDay();

    const todayKey = watDateKey(new Date());
    const workingDaySet = this.workingDays();
    const itemsMap = this.itemsByDay();
    const attendance = this.attendanceByDay();
    const upcomingEvents = this.upcoming();

    const cells: (DayCell | null)[] = Array(firstWeekday).fill(null);

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${pad(month + 1)}-${pad(day)}`;
      const date = new Date(year, month, day);
      const isWeekend = !workingDaySet.has(dateKey);
      const dayItems = itemsMap.get(dateKey) ?? [];
      const dayEvents = upcomingEvents.filter(
        (e) =>
          watDateKey(new Date(e.startsAt ?? (e as any).startDate)) === dateKey,
      );
      const onLeave = dayItems.some((item) => item.type === "LEAVE");

      let status: DayStatus;
      if (isWeekend) {
        status = "WEEKEND";
      } else if (dateKey > todayKey) {
        status = "UPCOMING";
      } else if (onLeave) {
        status = "LEAVE";
      } else {
        const record = attendance.get(dateKey);
        if (record) {
          status =
            record.status === "LATE"
              ? "LATE"
              : record.status === "HALF_DAY"
                ? "HALF_DAY"
                : "PRESENT";
        } else if (this.isExempt()) {
          status = "EXEMPT";
        } else if (dateKey === todayKey) {
          status = "PENDING";
        } else {
          status = "ABSENT";
        }
      }

      cells.push({
        day,
        date,
        dateKey,
        isWeekend,
        status,
        events: dayEvents,
        items: dayItems,
      });
    }

    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  });

  ngOnInit(): void {
    this.usersService.me().subscribe({
      next: (user) => this.isExempt.set(user.attendanceExempt),
      error: () => {},
    });
    this.load();
    this.eventsService
      .upcoming()
      .subscribe((events) => this.upcoming.set(events));
  }

  load(): void {
    this.loading.set(true);
    const year = this.cursor().getFullYear();
    const month = this.cursor().getMonth() + 1;

    this.calendarService.monthly(year, month).subscribe({
      next: (res) => {
        this.workingDays.set(new Set(res.workingDays ?? []));

        const map = new Map<string, CalendarItem[]>();
        for (const item of res.items ?? []) {
          for (const key of expandDateRange(item.startDate, item.endDate)) {
            const existing = map.get(key) ?? [];
            existing.push(item);
            map.set(key, existing);
          }
        }
        this.itemsByDay.set(map);
      },
      error: () => {},
    });

    this.attendanceService.me().subscribe((records) => {
      const map = new Map<string, AttendanceRecord>();
      for (const record of records) {
        map.set(watDateKey(new Date(record.checkInAt)), record);
      }
      this.attendanceByDay.set(map);
      this.loading.set(false);
    });
  }

  prevMonth(): void {
    const d = this.cursor();
    this.cursor.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
    this.load();
  }

  nextMonth(): void {
    const d = this.cursor();
    this.cursor.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
    this.load();
  }

  cellClasses(cell: DayCell): string {
    const base =
      "relative min-h-20 rounded-lg border p-1.5 text-left transition-colors";
    const map: Record<DayStatus, string> = {
      WEEKEND: "border-line bg-surface-muted opacity-50",
      PRESENT: "cal-present",
      LATE: "cal-late",
      HALF_DAY: "cal-late",
      LEAVE: "cal-leave",
      ABSENT: "cal-absent",
      PENDING: "border-line bg-surface",
      UPCOMING: "border-line bg-surface",
      EXEMPT:
        "cal-exempt",
    };
    return `${base} ${map[cell.status]}`;
  }

  statusLabel(status: DayStatus): string | null {
    const labels: Partial<Record<DayStatus, string>> = {
      PRESENT: "Present",
      LATE: "Late",
      HALF_DAY: "Half Day",
      LEAVE: "Leave",
      ABSENT: "Absent",
      EXEMPT: "Present (By default)",
    };
    return labels[status] ?? null;
  }
}
