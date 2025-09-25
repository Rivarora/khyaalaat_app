
'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send, Share2, Trash2 } from 'lucide-react';
import { useState, useTransition, useEffect } from 'react';

import type { Poetry, Comment } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { deletePoetry, likePoetry, addComment, deleteComment } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from './providers/auth-provider';

type PoetryCardProps = {
  poetry: Poetry;
  index: number;
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

export function PoetryCard({ poetry, index }: PoetryCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(poetry.likes);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isCommentActionPending, startCommentActionTransition] = useTransition();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const likedPoems = JSON.parse(localStorage.getItem('likedPoems') || '[]');
    setIsLiked(likedPoems.includes(poetry.id));
  }, [poetry.id]);
  
  useEffect(() => {
    setComments(poetry.comments || []);
  }, [poetry.comments]);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      const likedPoems = JSON.parse(localStorage.getItem('likedPoems') || '[]');
      const newIsLiked = !isLiked;
      
      setIsLiked(newIsLiked);
      setLikes(newIsLiked ? likes + 1 : likes - 1);

      if (newIsLiked) {
        localStorage.setItem('likedPoems', JSON.stringify([...likedPoems, poetry.id]));
      } else {
        localStorage.setItem('likedPoems', JSON.stringify(likedPoems.filter((id: string) => id !== poetry.id)));
      }

      try {
        await likePoetry(poetry.id, newIsLiked);
      } catch (error) {
        // Revert UI changes on error
        setIsLiked(!newIsLiked);
        setLikes(newIsLiked ? likes - 1 : likes + 1);
        const originalLikedPoems = newIsLiked 
          ? likedPoems.filter((id: string) => id !== poetry.id)
          : [...likedPoems, poetry.id];
        localStorage.setItem('likedPoems', JSON.stringify(originalLikedPoems));
        
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to update like status.',
        });
      }
    });
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
      startCommentActionTransition(async () => {
        const tempId = `temp-${Date.now()}`;
        const optimisticComment: Comment = { id: tempId, text: newComment.trim() };
        
        setComments(prev => [...prev, optimisticComment]);
        setNewComment('');

        try {
          await addComment(poetry.id, newComment.trim());
          // Ideally, re-fetch comments or get the real comment back from the server action
          // For now, we'll just let the optimistic one stay, a full page refresh will fix it.
        } catch (error) {
           setComments(prev => prev.filter(c => c.id !== tempId));
           toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to add comment.',
           });
        }
      });
    }
  };

  const handleDeleteComment = (commentId: string) => {
    startCommentActionTransition(async () => {
      const originalComments = comments;
      setComments(prev => prev.filter(c => c.id !== commentId));
      try {
        await deleteComment(poetry.id, commentId);
      } catch (error) {
        setComments(originalComments);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to delete comment.',
        });
      }
    });
  };

  const handleDelete = async () => {
    // This action should be protected on the server side as well, but this is a client-side check
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Unauthorized',
            description: 'You must be an admin to delete poems.',
        });
        return;
    }
    
    startTransition(async () => {
        // No optimistic deletion needed with AnimatePresence, it handles exit animations
        try {
          await deletePoetry(poetry.id);
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
    });
  };

  return (
    <Dialog onOpenChange={(open) => !open && setShowComments(false)}>
      <DialogTrigger asChild>
        <motion.div
          data-trigger-id={poetry.id}
          className="group relative block w-full cursor-pointer overflow-hidden rounded-lg break-inside-avoid shadow-lg bg-card"
          variants={cardVariants}
          layout
          whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
        >
          <motion.div className="relative">
            <Image
              src={poetry.image.imageUrl}
              alt={poetry.title}
              width={600}
              height={Math.floor(Math.random() * (950 - 600 + 1)) + 600}
              className="object-cover w-full h-auto"
              data-ai-hint={poetry.image.imageHint}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
            {user && (
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="text-white bg-black/30 hover:bg-red-500/50 hover:text-white rounded-full"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-2xl font-headline font-bold text-white drop-shadow-lg">
                {poetry.title}
              </h3>
              {poetry.caption && (
                <p className="mt-1 text-sm text-white/90 line-clamp-2">{poetry.caption}</p>
              )}
               <div className="flex items-center gap-1 mt-4 text-white">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    disabled={isPending}
                    className="hover:bg-white/20 text-white !px-2"
                  >
                    <Heart
                      className={cn(
                        'mr-2 h-5 w-5 transition-all',
                        isLiked ? 'fill-red-500 text-red-500' : 'fill-white'
                      )}
                    />
                    {likes}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                        e.stopPropagation();
                        // This will trigger the dialog, and we want to see comments there
                        document.querySelector(`[data-trigger-id="${poetry.id}"]`)?.click();
                        setTimeout(() => setShowComments(true), 150);
                    }}
                    className="hover:bg-white/20 text-white"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                    className="hover:bg-white/20 text-white"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full p-0 flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 flex-1 min-h-0">
          <div className="relative h-full min-h-[300px] md:min-h-[500px]">
            <Image
              src={poetry.image.imageUrl}
              alt={poetry.title}
              fill
              className="object-cover md:rounded-l-lg"
              data-ai-hint={poetry.image.imageHint}
            />
          </div>
          <div className="p-8 flex flex-col">
            <DialogHeader>
              <DialogTitle className="font-headline text-4xl mb-4 text-primary">{poetry.title}</DialogTitle>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto pr-4">
              <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed font-body">{poetry.poem}</p>
            </div>
            <div className="mt-6 pt-4 border-t">
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
                    onClick={(e) => { e.stopPropagation(); handleShare(e); }}
                    className="hover:bg-accent/50"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); handleCommentToggle(); }}
                    className="hover:bg-accent/50"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleLike(e); }}
                    disabled={isPending}
                    className="hover:bg-accent/50"
                  >
                    <Heart
                      className={cn(
                        'mr-2 h-5 w-5 transition-all',
                        isLiked ? 'fill-red-500 text-red-500' : 'fill-muted-foreground'
                      )}
                    />
                    {likes}
                  </Button>
                </motion.div>
              </div>
              <AnimatePresence>
                {showComments && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 mt-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Input
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => { e.stopPropagation(); setNewComment(e.target.value); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); handleAddComment(); } }}
                        disabled={isCommentActionPending}
                        className="flex-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Button onClick={(e) => { e.stopPropagation(); handleAddComment(); }} size="icon" disabled={isCommentActionPending}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {comments && comments.length > 0 ? (
                        comments.map((comment) => (
                          <div key={comment.id} className="group/comment text-sm p-2 rounded-md bg-muted flex justify-between items-center">
                            <span>{comment.text}</span>
                            {user && <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 opacity-0 group-hover/comment:opacity-100"
                              onClick={(e) => { e.stopPropagation(); handleDeleteComment(comment.id); }}
                              disabled={isCommentActionPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive/70" />
                            </Button>}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center">No comments yet.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

    
