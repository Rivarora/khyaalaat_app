'use client';

import { useTransition } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { toggleRequestCompleted } from '@/app/request/actions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/providers/auth-provider';

type CompletedCheckboxProps = {
  requestId: string;
  isCompleted: boolean;
};

export function CompletedCheckbox({ requestId, isCompleted }: CompletedCheckboxProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.email === 'arorariva19@gmail.com';

  const handleCheckedChange = (checked: boolean) => {
    if (!isAdmin) {
      toast({ variant: 'destructive', title: 'Not allowed', description: 'Only admin can update status.' });
      return;
    }
    startTransition(async () => {
      try {
        await toggleRequestCompleted(requestId, checked);
        toast({
          title: 'Success',
          description: `Request status updated.`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to update request status.',
        });
      }
    });
  };

  return (
    <Checkbox
      checked={isCompleted}
      onCheckedChange={handleCheckedChange}
      disabled={isPending || !isAdmin}
      aria-label="Mark as completed"
    />
  );
}
