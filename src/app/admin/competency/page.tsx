import React from 'react';
import { CompetencyRadarCard } from '@/components/admin/CompetencyRadarCard';
import { Sidebar } from '@/components/layout/Sidebar';

export default function AdminCompetencyMappingPage() {
  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
      <Sidebar role="ADMIN" />

      <main className="flex-1 min-w-0">
        <CompetencyRadarCard />
      </main>
    </div>
  );
}
