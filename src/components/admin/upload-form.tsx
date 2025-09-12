'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect, useRef } from 'react';
import { UploadCloud } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { uploadPoetry } from '@/lib/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full" size="lg">
      <UploadCloud className="mr-2 h-4 w-4" />
      {pending ? 'Uploading...' : 'Upload Poetry'}
    </Button>
  );
}

export function UploadForm() {
  const initialState = { message: '', errors: {} };
  const [state, dispatch] = useActionState(uploadPoetry, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message?.startsWith('Error')) {
      toast({
        title: 'Upload Failed',
        description: state.message,
        variant: 'destructive',
      });
    } else if (state?.message) {
      toast({
        title: 'Upload Successful',
        description: state.message,
      });
      formRef.current?.reset();
    }
  }, [state, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Upload New Poetry</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={dispatch} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="The Whispering Wind" required />
            {state?.errors?.title && <p className="text-sm text-destructive">{state.errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Poetry Image</Label>
            <Input id="image" name="image" type="file" accept="image/*" required />
            {state?.errors?.image && <p className="text-sm text-destructive">{state.errors.image}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">Short Caption (Optional Preview)</Label>
            <Textarea id="caption" name="caption" placeholder="A short caption or excerpt for the card..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="poem">Full Poem</Label>
            <Textarea id="poem" name="poem" placeholder="Enter the full poem text here." required className="min-h-[150px]" />
            {state?.errors?.poem && <p className="text-sm text-destructive">{state.errors.poem}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="genre">Genre</Label>
            <Select name="genre" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Love">Love</SelectItem>
                <SelectItem value="Sad">Sad</SelectItem>
                <SelectItem value="Motivational">Motivational</SelectItem>
                <SelectItem value="Nature">Nature</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
             {state?.errors?.genre && <p className="text-sm text-destructive">{state.errors.genre}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="mood">Mood (Optional)</Label>
              <Input id="mood" name="mood" placeholder="e.g., Hopeful" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (Optional)</Label>
              <Input id="tags" name="tags" placeholder="e.g., reflection, life, journey" />
            </div>
          </div>
          
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
