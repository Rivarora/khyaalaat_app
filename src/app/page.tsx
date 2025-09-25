'use client';
import { Header } from '@/components/header';
import { PoetryCard } from '@/components/poetry-card';
import { SplashScreen } from '@/components/splash-screen';
import { getPoetryData } from '@/lib/data';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';
import type { Poetry } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function PoetryList({ poetryData }: { poetryData: Poetry[] }) {
  return (
    <motion.div
      layout
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3 xl:columns-4"
    >
      <AnimatePresence>
        {poetryData.length > 0 ? (
          poetryData.map((poetry, index) => (
            <PoetryCard key={poetry.id} poetry={poetry} index={index} />
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="col-span-full text-center text-muted-foreground"
          >
            <p>No poems found for this genre.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Home() {
  const [poetryData, setPoetryData] = useState<Poetry[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('All');

  useEffect(() => {
    async function loadData() {
      const data = await getPoetryData();
      setPoetryData(data);
    }
    loadData();
  }, []);

  const genres = useMemo(() => {
    const allGenres = poetryData.map((p) => p.genre);
    return ['All', ...Array.from(new Set(allGenres))];
  }, [poetryData]);

  const filteredPoetry = useMemo(() => {
    if (selectedGenre === 'All') {
      return poetryData;
    }
    return poetryData.filter((p) => p.genre === selectedGenre);
  }, [poetryData, selectedGenre]);

  return (
    <>
      <SplashScreen />
      <Header />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="container mx-auto px-4 py-8 pt-24"
      >
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-headline font-black text-primary">Khyaalaat</h1>
          <p className="mt-4 text-lg text-muted-foreground">Thoughts rendered in verse and color.</p>
        </div>
        <div className="flex justify-center flex-wrap gap-2 mb-8">
          {genres.map((genre) => (
            <Button
              key={genre}
              variant={selectedGenre === genre ? 'default' : 'outline'}
              onClick={() => setSelectedGenre(genre)}
              className={cn(
                'capitalize transition-all duration-300',
                selectedGenre === genre
                  ? 'scale-105 shadow-lg'
                  : 'hover:bg-accent/50'
              )}
            >
              {genre}
            </Button>
          ))}
        </div>
        <PoetryList poetryData={filteredPoetry} />
      </motion.main>
    </>
  );
}
