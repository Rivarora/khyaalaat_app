'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send, Share2, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { Poetry } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { deletePoetry } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Separator } from './ui/separator';

type PoetryCardProps = {
  poetry: Poetry;
  index: number;
};

export function PoetryCard({ poetry, index }: PoetryCardProps) {
  const [likes, setLikes] = useState(poetry.likes);
  const [isLiked, setIsLiked] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState('');
  const { toast } = useToast();

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: poetry.title,
          text: `Check out this poem: ${poetry.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied',
        description: 'The link to this page has been copied to your clipboard.',
      });
    }
  };

  const handleCommentToggle = () => {
    setShowComments(!showComments);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, newComment.trim()]);
      setNewComment('');
    }
  };

  const handleDelete = async () => {
    try {
      await deletePoetry(poetry.id);
      setIsDeleted(true);
      toast({
        title: 'Poem Deleted',
        description: `"${poetry.title}" has been successfully deleted.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete the poem.',
      });
    }
  };

  if (isDeleted) {
    return null;
  }

  return (
    <motion.div
      className="group relative block w-full overflow-hidden rounded-lg break-inside-avoid shadow-lg bg-card"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      exit={{ opacity: 0, y: -20 }}
      layout
      whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
    >
      <motion.div className="relative">
        <Image
          src={poetry.image.imageUrl}
          alt={poetry.title}
          width={600}
          height={Math.floor(Math.random() * (950 - 600 + 1)) + 600} // Random height for masonry
          className="object-cover w-full h-auto"
          data-ai-hint={poetry.image.imageHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="text-white bg-black/30 hover:bg-red-500/50 hover:text-white rounded-full"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <motion.h3
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
            className="text-2xl font-headline font-bold text-white drop-shadow-lg"
          >
            {poetry.title}
          </motion.h3>
          <div className="flex justify-between items-center mt-3">
            <p className="text-sm font-semibold bg-primary/90 text-primary-foreground px-3 py-1 rounded-full backdrop-blur-sm">
              {poetry.genre}
            </p>
            <motion.div
              className="flex items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="text-white hover:bg-white/20 hover:text-white rounded-full"
              >
                <Share2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCommentToggle}
                className="text-white hover:bg-white/20 hover:text-white rounded-full"
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className="text-white hover:bg-white/20 hover:text-white rounded-full"
              >
                <Heart
                  className={cn(
                    'mr-2 h-5 w-5 transition-all',
                    isLiked ? 'fill-red-500 text-red-500' : 'fill-white'
                  )}
                />
                {likes}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4"
          >
            <Separator className="mb-4" />
            <div className="flex items-center gap-2 mb-4">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                className="flex-1"
              />
              <Button onClick={handleAddComment} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {comments.length > 0 ? (
                comments.map((comment, i) => (
                  <div key={i} className="text-sm p-2 rounded-md bg-muted/50">
                    {comment}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center">No comments yet.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
