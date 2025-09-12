import { Header } from '@/components/header';
import { PoetryCard } from '@/components/poetry-card';
import { SplashScreen } from '@/components/splash-screen';
import { poetryData } from '@/lib/data';

export default function Home() {
  return (
    <>
      <SplashScreen />
      <Header />
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-headline font-black text-primary">Khyaalaat</h1>
          <p className="mt-4 text-lg text-muted-foreground">Thoughts rendered in verse and color.</p>
        </div>
        <div className="columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3 xl:columns-4">
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
        </div>
      </main>
    </>
  );
}
