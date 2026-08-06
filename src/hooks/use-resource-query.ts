import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { resourceApi } from '@/services/api/resource.api';
import type { QueryParams } from '@/types/api';

export function useResourceQuery<T>(resource: string, path: string, params: QueryParams) {
  const stableParams = useMemo(() => params, [
    params.page,
    params.limit,
    params.search,
    params.sortBy,
    params.sortOrder,
    JSON.stringify(params.filters),
  ]);

  return useQuery({
    queryKey: [resource, stableParams],
    queryFn: () => resourceApi.list<T>(path, stableParams)
  });
}
