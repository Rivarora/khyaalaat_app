'use client';
import { Header } from '@/components/header';
import { SuggestionForm } from './suggestion-form';
import { motion } from 'framer-motion';

export default function RequestPage() {
  return (
    <>
      <Header />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="container mx-auto px-4 py-8 pt-24"
      >
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-headline font-black text-primary">
              Request a Poem
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Have a specific idea for a poem? Fill out the form below to send your request.
            </p>
          </div>
          <SuggestionForm />
        </div>
      </motion.main>
    </>
  );
}
