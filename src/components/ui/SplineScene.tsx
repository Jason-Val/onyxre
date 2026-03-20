'use client';

import dynamic from 'next/dynamic';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full text-cyan">
      <div className="flex flex-col items-center gap-2">
         <span className="material-symbols-outlined animate-spin">data_usage</span>
         <span className="text-sm font-mono tracking-widest text-slate-500">INITIALIZING 3D ENGINE...</span>
      </div>
    </div>
  ),
});

interface SplineSceneProps {
  scene: string;
  className?: string;
}

export default function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <div className={`w-full h-full ${className || ''}`}>
      <Spline scene={scene} />
    </div>
  );
}
