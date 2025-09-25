'use client';
import { Header } from '@/components/header';
import { PoetryCard } from '@/components/poetry-card';
import { SplashScreen } from '@/components/splash-screen';
import { getPoetryData } from '@/lib/data';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Poetry } from '@/lib/definitions';

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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3 xl:columns-4"
    >
      {poetryData.length > 0 ? (
        poetryData.map((poetry, index) => (
          <PoetryCard key={poetry.id} poetry={poetry} index={index} />
        ))
      ) : (
        <div className="col-span-full text-center text-muted-foreground">
          <p>No poems have been uploaded yet.</p>
          <p>Uploaded poems will appear here.</p>
        </div>
      )}
    </motion.div>
  );
}

export default function Home() {
  const [poetryData, setPoetryData] = useState<Poetry[]>([]);

  useEffect(() => {
    async function loadData() {
      const data = await getPoetryData();
      setPoetryData(data);
    }
    loadData();
  }, []);

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
        <PoetryList poetryData={poetryData} />
      </motion.main>
    </>
  );
}
