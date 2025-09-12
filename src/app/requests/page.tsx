import { Header } from '@/components/header';
import { getRequests } from '@/lib/requests';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CompletedCheckbox } from './completed-checkbox';
import { cn } from '@/lib/utils';
import { DeleteRequestButton } from './delete-request-button';

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
                  <TableHead className="w-[50px]">Done</TableHead>
                  <TableHead className="w-[150px]">Requester</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Mood</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                  <TableHead className="w-[50px]">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length > 0 ? (
                  requests.map((request) => (
                    <TableRow key={request.id} className={cn(request.completed && 'bg-muted/50 text-muted-foreground')}>
                      <TableCell>
                        <CompletedCheckbox requestId={request.id} isCompleted={request.completed} />
                      </TableCell>
                      <TableCell className="font-medium">{request.name}</TableCell>
                      <TableCell>{request.topic}</TableCell>
                      <TableCell>
                        <Badge variant={request.completed ? 'outline' : 'secondary'}>{request.genre}</Badge>
                      </TableCell>
                       <TableCell>{request.mood}</TableCell>
                      <TableCell className="text-right">
                        {format(new Date(request.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <DeleteRequestButton requestId={request.id} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
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
