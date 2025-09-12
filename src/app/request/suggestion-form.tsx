'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState, useTransition } from 'react';
import { Wand2, Loader2 } from 'lucide-react';

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
import { getSuggestions } from './actions';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';

const formSchema = z.object({
  topic: z.string().min(2, {
    message: 'Topic must be at least 2 characters.',
  }),
  genre: z.enum(['Love', 'Sad', 'Motivational', 'Nature']),
  mood: z.string().min(2, {
    message: 'Mood must be at least 2 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
});

type Suggestions = {
  suggestions: string[];
};

export function SuggestionForm() {
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      mood: '',
      description: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setSuggestions(null);
    startTransition(async () => {
      const result = await getSuggestions(values);
      if (result.success && result.data) {
        setSuggestions(result.data);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      }
    });
  }

  return (
    <>
      <Card className="bg-card/50 border-2 border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Describe Your Vision</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Autumn Rain" {...field} />
                    </FormControl>
                    <FormDescription>What is the central theme?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mood</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Reflective, Somber" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us more about your idea, any specific imagery, or feelings you want to evoke."
                        className="resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending} className="w-full" size="lg">
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generate Suggestions
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <AnimatePresence>
        {isPending && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
                  Generating Ideas...
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-4 bg-muted-foreground/10 rounded-full w-3/4 animate-pulse"></div>
                <div className="h-4 bg-muted-foreground/10 rounded-full w-1/2 animate-pulse"></div>
                <div className="h-4 bg-muted-foreground/10 rounded-full w-5/6 animate-pulse"></div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {suggestions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className="border-primary border-2">
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center">
                  <Wand2 className="mr-2 h-6 w-6 text-primary" />
                  Here are some creative directions:
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-lg">
                  {suggestions.suggestions.map((s, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                    >
                      {s}
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
