// src/app/page.tsx
import { FloorPlan } from '@/components/ui/floor-plan';
import { StatusPanel } from '@/components/ui/status-panel';

export default function Home() {
  return (
    <main className="container mx-auto p-4 dark:bg-black">
      <h1 className="text-3xl font-bold mb-8">Nursing Home</h1>
      
      <div className="">
        <div className="lg:col-span-2">
          <FloorPlan className="w-full h-full flex justify-center" />
        </div>
        <div className=''>
          <StatusPanel />
        </div>
      </div>
    </main>
  );
}