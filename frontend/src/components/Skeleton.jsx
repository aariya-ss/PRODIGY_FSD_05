import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm animate-pulse">
      {/* Image space */}
      <div className="h-56 bg-slate-200 dark:bg-slate-800 w-full" />
      {/* Body details */}
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
          <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-full w-24" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 animate-pulse py-8">
      {/* Product Image */}
      <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
      {/* Product details */}
      <div className="flex flex-col space-y-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded w-full" />
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
        <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-full w-full pt-4" />
      </div>
    </div>
  );
}
