import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getInventory } from '../services/api';
import { TowerSidebar } from '../components/TowerSidebar';
import { InventoryGrid } from '../components/InventoryGrid';
import { BookingModal } from '../components/BookingModal';
import { Loader } from '../components/Loader';
import { ErrorState } from '../components/ErrorState';
import { useKioskStore } from '../store/useKioskStore';

export const InventoryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { bookingModalUnitId } = useKioskStore();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['inventory'],
    queryFn: getInventory,
    refetchInterval: 15000, // Background auto-refresh
  });

  if (isLoading) return <Loader label="Loading Inventory & Tower Status..." />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  const currentBookingUnit = bookingModalUnitId
    ? data.towers.flatMap((t) => t.units.map(u => ({ unit: u, towerName: t.name }))).find((item) => item.unit.id === bookingModalUnitId)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <TowerSidebar towers={data.towers} />
        <InventoryGrid data={data} />
      </div>

      {currentBookingUnit && (
        <BookingModal
          unit={currentBookingUnit.unit}
          towerName={currentBookingUnit.towerName}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
          }}
        />
      )}
    </div>
  );
};
