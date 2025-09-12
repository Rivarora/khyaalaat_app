'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import { UploadCloud } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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

const uploadSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  caption: z.string().optional(),
  genre: z.enum(['Love', 'Sad', 'Motivational', 'Nature', 'Other']),
  mood: z.string().optional(),
  tags: z.string().optional(),
  image: z.any().refine((files) => files?.length === 1, 'Image is required.'),
});

export function UploadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof uploadSchema>>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: '',
      caption: '',
      mood: '',
      tags: '',
    },
  });

  function onSubmit(values: z.infer<typeof uploadSchema>) {
    setIsSubmitting(true);
    console.log(values);
    // In a real app, you would handle file upload to Firebase Storage here.
    setTimeout(() => {
      toast({
        title: 'Upload Successful',
        description: `Poetry "${values.title}" has been uploaded.`,
      });
      form.reset();
      setIsSubmitting(false);
    }, 1500);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Upload New Poetry</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="The Whispering Wind" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poetry Image</FormLabel>
                  <FormControl>
                    <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} />
                  </FormControl>
                  <FormDescription>
                    Upload the image file for the poetry.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="caption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caption (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A short caption or excerpt..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genre</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a genre" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Love">Love</SelectItem>
                      <SelectItem value="Sad">Sad</SelectItem>
                      <SelectItem value="Motivational">Motivational</SelectItem>
                      <SelectItem value="Nature">Nature</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mood (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Hopeful" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., reflection, life, journey" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
              <UploadCloud className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Uploading...' : 'Upload Poetry'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
