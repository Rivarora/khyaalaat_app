'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UploadCloud, Loader2 } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/firebase';
import { uploadPoetry } from '@/lib/actions';
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  image: z
    .any()
    .refine((files) => files?.length == 1, 'Image is required.')
    .refine((files) => files?.[0]?.size <= 5000000, `Max file size is 5MB.`)
    .refine(
      (files) => ['image/jpeg', 'image/png', 'image/webp'].includes(files?.[0]?.type),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),
  caption: z.string().optional(),
  poem: z.string().min(10, 'Full poem must be at least 10 characters.'),
  genre: z.enum(['Love', 'Sad', 'Motivational', 'Nature', 'Other']),
  mood: z.string().optional(),
  tags: z.string().optional(),
});

type UploadFormValues = z.infer<typeof formSchema>;

export function UploadForm() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      caption: '',
      poem: '',
      mood: '',
      tags: '',
    },
  });

  const onSubmit = async (values: UploadFormValues) => {
    setIsUploading(true);
    setUploadProgress(0);
    const imageFile = values.image[0];

    try {
      const filename = `${Date.now()}-${imageFile.name}`;
      const imagePath = `poetry-images/${filename}`;
      const storageRef = ref(storage, imagePath);
      const uploadTask = uploadBytesResumable(storageRef, imageFile, {
        contentType: imageFile.type,
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          toast({
            title: 'Image Upload Failed',
            description: 'Could not upload image. Please check storage rules and try again.',
            variant: 'destructive',
          });
          setIsUploading(false);
        },
        async () => {
          const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
          const result = await uploadPoetry({ ...values, image: undefined }, imageUrl, imagePath);

          if (result.success) {
            toast({
              title: 'Upload Successful',
              description: result.message,
            });
            form.reset();
          } else {
            toast({
              title: 'Upload Failed',
              description: result.message,
              variant: 'destructive',
            });
          }
          setIsUploading(false);
        }
      );
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
      setIsUploading(false);
    }
  };

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
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => field.onChange(e.target.files)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="caption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Caption (Optional Preview)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A short caption or excerpt for the card..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="poem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Poem</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the full poem text here."
                      className="min-h-[150px]"
                      {...field}
                    />
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
                      <Input placeholder="e.g., reflection, life" {...field} />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isUploading && (
              <div className="space-y-2">
                <Label>Upload Progress</Label>
                <Progress value={uploadProgress} />
              </div>
            )}

            <Button type="submit" disabled={isUploading} className="w-full" size="lg">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload Poetry
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
