import { Header } from '@/components/header';
import { UploadForm } from '@/components/admin/upload-form';

export default function AdminUploadPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-headline font-black text-primary">
              Admin Dashboard
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Upload and manage poetry.
            </p>
          </div>
          <UploadForm />
        </div>
      </main>
    </>
  );
}
