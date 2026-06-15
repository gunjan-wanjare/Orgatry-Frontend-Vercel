import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Download, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    style?: CSSProperties;
    sticky?: 'left' | 'right';
  }
}
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type DataTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData>[];
  isLoading?: boolean;
  emptyTitle: string;
  emptyDescription: string;
  manualSorting?: boolean;
  fullWidth?: boolean;
  onSortingChange?: (sorting: SortingState) => void;
  onExport?: () => void;
  page?: number;
  totalPages?: number;
  total?: number;
  onPageChange?: (page: number) => void;
};

export function DataTable<TData>({
  data,
  columns,
  isLoading = false,
  emptyTitle,
  emptyDescription,
  manualSorting = false,
  fullWidth = true,
  onSortingChange,
  onExport,
  page = 1,
  totalPages = 1,
  total = data.length,
  onPageChange
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const tableColumns = useMemo(() => columns, [columns]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnVisibility
    },
    manualSorting,
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(next);
      onSortingChange?.(next);
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    ...(manualSorting ? {} : { getSortedRowModel: getSortedRowModel() }),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-14 rounded-xl" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="size-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllLeafColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuItem key={column.id} onSelect={(event) => event.preventDefault()}>
                  <Checkbox checked={column.getIsVisible()} onCheckedChange={(checked) => column.toggleVisibility(Boolean(checked))} />
                  {column.id}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {onExport ? (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="size-4" />
            CSV
          </Button>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
          <table className={cn("min-w-[760px] border-collapse text-sm", fullWidth && "w-full")}>
            <thead className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const sticky = header.column.columnDef.meta?.sticky;
                    const stickyStyle: CSSProperties = sticky
                      ? {
                          position: 'sticky',
                          zIndex: 20,
                          backgroundColor: 'hsl(var(--background))',
                          ...(sticky === 'right' ? { right: 0 } : { left: 0 }),
                        }
                      : {};
                    return (
                    <th key={header.id} className="border-b border-border px-4 py-3 text-left font-medium text-muted-foreground" style={{ ...stickyStyle, ...header.column.columnDef.meta?.style }}>
                      {header.isPlaceholder ? null : (
                          <button
                          className={cn(
                            'inline-flex items-center gap-1',
                            header.column.getCanSort() && 'hover:text-foreground',
                            header.column.getIsSorted() && 'text-foreground'
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort()
                            ? header.column.getIsSorted() === 'asc'
                              ? <ChevronUp className="size-3" />
                              : header.column.getIsSorted() === 'desc'
                                ? <ChevronDown className="size-3" />
                                : <ChevronDown className="size-3 text-muted-foreground/30" />
                            : null}
                        </button>
                      )}
                    </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-border/70 transition-colors hover:bg-white/[0.035]">
                  {row.getVisibleCells().map((cell) => {
                    const sticky = cell.column.columnDef.meta?.sticky;
                    const stickyStyle: CSSProperties = sticky
                      ? {
                          position: 'sticky',
                          zIndex: 10,
                          backgroundColor: 'hsl(var(--background))',
                          ...(sticky === 'right' ? { right: 0 } : { left: 0 }),
                        }
                      : {};
                    return (
                    <td key={cell.id} className="px-4 py-4 text-muted-foreground" style={{ ...stickyStyle, ...cell.column.columnDef.meta?.style }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {Math.max(totalPages, 1)} · {total} records
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)}>
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange?.(page + 1)}>
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
