"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Image {
  url: string;
}

interface LightboxProps {
  images: Image[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function Lightbox({ images, initialIndex, isOpen, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const next = () => setIndex((prev) => (prev + 1) % images.length);
  const prev = () => setIndex((prev) => (prev - 1 + images.length) % images.length);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center"
        onClick={onClose}
      >
        {/* Header */}
        <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
          <div className="text-white/40 text-xs font-bold uppercase tracking-widest">
            {index + 1} / {images.length}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Main Image */}
        <div 
          className="relative w-full max-w-5xl aspect-video p-4 flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.img
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            src={images[index].url}
            className="max-h-full max-w-full object-contain shadow-2xl rounded-lg"
          />

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-6 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:scale-110 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <button
                onClick={next}
                className="absolute right-6 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:scale-110 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        <div 
          className="absolute bottom-6 inset-x-0 flex justify-center gap-2 px-6 overflow-x-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-16 h-12 rounded-lg border-2 overflow-hidden transition-all shrink-0 ${
                i === index ? "border-cyan scale-110" : "border-transparent opacity-40 hover:opacity-100"
              }`}
            >
              <img src={img.url} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
