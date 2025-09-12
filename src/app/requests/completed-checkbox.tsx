'use client';

import { useTransition } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { toggleRequestCompleted } from '@/app/request/actions';
import { useToast } from '@/hooks/use-toast';

type CompletedCheckboxProps = {
  requestId: string;
  isCompleted: boolean;
};

export function CompletedCheckbox({ requestId, isCompleted }: CompletedCheckboxProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleCheckedChange = (checked: boolean) => {
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
      disabled={isPending}
      aria-label="Mark as completed"
    />
  );
}
