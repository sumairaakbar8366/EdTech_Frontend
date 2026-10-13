import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { PLATFORM_KEY } from '@/features/platform/hooks/usePlatform';
import { systemService } from '@/features/platform/services/systemService';
import type { DeliveryFilter } from '@/features/platform/types/system.types';

export const DELIVERIES_KEY = [...PLATFORM_KEY, 'system', 'deliveries'] as const;
export const JOBS_KEY = [...PLATFORM_KEY, 'system', 'jobs'] as const;

/** Polls so queued messages turn "sent" on screen without a reload. */
export const useDeliveries = (filter: DeliveryFilter) =>
  useQuery({ queryKey: [...DELIVERIES_KEY, filter], queryFn: () => systemService.deliveries(filter), placeholderData: keepPreviousData, refetchInterval: 10_000 });

export const useJobs = () => useQuery({ queryKey: JOBS_KEY, queryFn: systemService.jobs, refetchInterval: 30_000 });
