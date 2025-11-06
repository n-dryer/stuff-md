import React from 'react';

interface NoteListSkeletonProps {
  viewMode: 'grid' | 'table';
}

const NoteListSkeleton: React.FC<NoteListSkeletonProps> = ({ viewMode }) => {
  return (
    <div aria-live='polite' className='min-h-[400px]'>
      <div className='space-y-[clamp(1rem,2.5vw,1.5rem)]'>
        {/* Header skeleton */}
        <div className='flex justify-between items-center mb-[clamp(1rem,2.5vw,1.5rem)]'>
          <div className='h-[clamp(1.25rem,3vw,1.5rem)] w-[clamp(6rem,15vw,7rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
          <div className='h-[clamp(1.75rem,4vw,2rem)] w-[clamp(3.5rem,9vw,4rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
        </div>
        {/* Filters skeleton */}
        <div className='mb-[clamp(1.25rem,3vw,1.5rem)]'>
          <div className='h-[clamp(2.5rem,6vw,3rem)] w-full bg-off-black/10 dark:bg-off-white/10 border-2 border-accent-black/20 dark:border-off-white/20 brutalist-pulse' />
          <div className='mt-[clamp(0.75rem,2vw,1rem)] flex gap-[clamp(0.5rem,1.5vw,0.75rem)]'>
            <div className='h-[clamp(1.75rem,4vw,2rem)] w-[clamp(5rem,12vw,6rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
            <div className='h-[clamp(1.75rem,4vw,2rem)] w-[clamp(4rem,10vw,5rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
          </div>
        </div>
        {/* Conditional skeleton based on viewMode */}
        {viewMode === 'grid' ? (
          /* Grid view skeleton */
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-x-[clamp(2rem,5vw,3rem)] gap-y-[clamp(1rem,2.5vw,1.5rem)]'>
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className='border-2 border-accent-black dark:border-off-white/20 shadow-brutalist dark:shadow-brutalist-dark p-[clamp(0.75rem,2vw,1rem)] min-h-[clamp(11rem,28vw,13rem)]'
              >
                {/* Title skeleton */}
                <div className='h-[clamp(1.125rem,2.8vw,1.25rem)] w-3/4 bg-off-black/10 dark:bg-off-white/10 mb-[clamp(0.5rem,1.5vw,0.75rem)] brutalist-pulse' />
                {/* Content skeleton */}
                <div className='h-[clamp(3.5rem,9vw,4rem)] w-full bg-off-black/10 dark:bg-off-white/10 mb-[clamp(0.5rem,1.5vw,0.75rem)] brutalist-pulse' />
                {/* Tags skeleton */}
                <div className='flex gap-[clamp(0.5rem,1.5vw,0.75rem)] mt-[clamp(0.75rem,2vw,1rem)]'>
                  <div className='h-[clamp(1.25rem,3vw,1.5rem)] w-[clamp(4.5rem,11vw,5rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
                  <div className='h-[clamp(1.25rem,3vw,1.5rem)] w-[clamp(3.5rem,9vw,4rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
                </div>
                {/* Date skeleton */}
                <div className='h-[clamp(0.875rem,2.2vw,1rem)] w-[clamp(5rem,12vw,6rem)] bg-off-black/10 dark:bg-off-white/10 mt-[clamp(0.5rem,1.5vw,0.75rem)] brutalist-pulse' />
              </div>
            ))}
          </div>
        ) : (
          /* Table view skeleton */
          <div className='w-full'>
            <table className='w-full text-left table-auto'>
              <thead className='border-b-2 border-accent-black dark:border-off-white/20'>
                <tr>
                  <th className='px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)]'>
                    <div className='h-[clamp(0.875rem,2vw,1rem)] w-[clamp(3rem,8vw,4rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
                  </th>
                  <th className='px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)]'>
                    <div className='h-[clamp(0.875rem,2vw,1rem)] w-[clamp(4rem,10vw,5rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
                  </th>
                  <th className='hidden sm:table-cell px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)]'>
                    <div className='h-[clamp(0.875rem,2vw,1rem)] w-[clamp(8rem,20vw,10rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
                  </th>
                  <th className='px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)]'>
                    <div className='h-[clamp(0.875rem,2vw,1rem)] w-[clamp(5rem,12vw,6rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
                  </th>
                  <th className='px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)]'>
                    <div className='h-[clamp(0.875rem,2vw,1rem)] w-[clamp(4rem,10vw,5rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <tr
                    key={idx}
                    className='border-b border-gray-200 dark:border-off-white/10'
                  >
                    <td className='px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)]'>
                      <div className='h-[clamp(1.25rem,3vw,1.5rem)] w-[clamp(1.25rem,3vw,1.5rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse mx-auto' />
                    </td>
                    <td className='px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)]'>
                      <div className='h-[clamp(1rem,2.5vw,1.25rem)] w-[clamp(6rem,15vw,8rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
                    </td>
                    <td className='hidden sm:table-cell px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)]'>
                      <div className='h-[clamp(3rem,7.5vw,3.5rem)] w-full bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
                    </td>
                    <td className='px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)]'>
                      <div className='h-[clamp(1.25rem,3vw,1.5rem)] w-[clamp(5rem,12vw,6rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
                    </td>
                    <td className='px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)]'>
                      <div className='h-[clamp(0.875rem,2.2vw,1rem)] w-[clamp(4rem,10vw,5rem)] bg-off-black/10 dark:bg-off-white/10 brutalist-pulse' />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteListSkeleton;
