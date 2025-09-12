import { Header } from '@/components/header';
import { getRequests } from '@/lib/requests';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default async function RequestsPage() {
  const requests = await getRequests();

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-headline font-black text-primary">
              Poem Requests
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Here are all the wonderful ideas submitted by visitors.
            </p>
          </div>
          
          <div className="border rounded-lg shadow-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Requester</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Mood</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length > 0 ? (
                  requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.name}</TableCell>
                      <TableCell>{request.topic}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{request.genre}</Badge>
                      </TableCell>
                       <TableCell>{request.mood}</TableCell>
                      <TableCell className="text-right">
                        {format(new Date(request.createdAt), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No requests yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </>
  );
}
