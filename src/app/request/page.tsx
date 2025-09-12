import { Header } from '@/components/header';
import { SuggestionForm } from './suggestion-form';

export default function RequestPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-headline font-black text-primary">
              Request a Poem
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Have an idea? Let our creative AI help you shape it.
            </p>
          </div>
          <SuggestionForm />
        </div>
      </main>
    </>
  );
}
