'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useState } from 'react';

import type { Poetry } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

type PoetryCardProps = {
  poetry: Poetry;
  index: number;
};

export function PoetryCard({ poetry, index }: PoetryCardProps) {
  const [likes, setLikes] = useState(poetry.likes);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
  };

  return (
    <motion.div
      className="group relative block w-full overflow-hidden rounded-lg break-inside-avoid shadow-lg"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <Image
        src={poetry.image.imageUrl}
        alt={poetry.title}
        width={600}
        height={Math.floor(Math.random() * (950 - 600 + 1)) + 600} // Random height for masonry
        className="object-cover w-full h-auto"
        data-ai-hint={poetry.image.imageHint}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-2xl font-headline font-bold text-white drop-shadow-lg">
          {poetry.title}
        </h3>
        <div className="flex justify-between items-center mt-3">
          <p className="text-sm font-semibold bg-primary/90 text-primary-foreground px-3 py-1 rounded-full backdrop-blur-sm">
            {poetry.genre}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className="text-white hover:bg-white/20 hover:text-white rounded-full"
          >
            <Heart
              className={cn(
                'mr-2 h-5 w-5 transition-all',
                isLiked ? 'fill-red-500 text-red-500' : 'fill-white'
              )}
            />
            {likes}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}