'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Camera, Heart, MessageCircle, FileText, Edit, Save, X } from 'lucide-react';
import { uploadUserAvatar, updateUserProfile } from '@/lib/users';
import { getUserComments } from '@/lib/comments';
import { getPoetryData } from '@/lib/data';
import { getRequests } from '@/lib/requests';
import { useToast } from '@/hooks/use-toast';
import type { Poetry, Comment, PoemRequest, User as UserDoc } from '@/lib/definitions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PoetryCard } from '@/components/poetry-card';
import { Textarea } from '@/components/ui/textarea';
import { updateComment } from '@/lib/actions';

export default function ProfilePage() {
  const { user, userDoc, loading } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [likedPoems, setLikedPoems] = useState<Poetry[]>([]);
  const [userComments, setUserComments] = useState<(Comment & { poetryId: string; poetryTitle: string })[]>([]);
  const [userRequests, setUserRequests] = useState<PoemRequest[]>([]);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (userDoc) {
      setName(userDoc.name);
      loadUserData();
    }
  }, [userDoc]);

  const loadUserData = async () => {
    if (!user || !userDoc) return;

    try {
      // Load liked poems
      const allPoetry = await getPoetryData();
      const liked = allPoetry.filter(poem => 
        poem.likes.some(like => like.id === user.uid)
      );
      setLikedPoems(liked);

      // Load user comments
      const comments = await getUserComments(user.uid);
      setUserComments(comments);

      // Load user requests
      const allRequests = await getRequests();
      const userReqs = allRequests.filter(req => req.userId === user.uid);
      setUserRequests(userReqs);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Please select an image smaller than 5MB.',
      });
      return;
    }

    setUploading(true);
    try {
      await uploadUserAvatar(user.uid, file);
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'Failed to upload avatar. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !userDoc) return;

    try {
      await updateUserProfile(user.uid, { name });
      setIsEditing(false);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'Failed to update profile. Please try again.',
      });
    }
  };

  const handleEditComment = (commentId: string, currentText: string) => {
    setEditingComment(commentId);
    setEditText(currentText);
  };

  const handleSaveComment = async (commentId: string, poetryId: string) => {
    if (!editText.trim()) return;

    try {
      await updateComment(poetryId, commentId, editText.trim());
      setEditingComment(null);
      setEditText('');
      loadUserData(); // Refresh comments
      toast({
        title: 'Comment updated',
        description: 'Your comment has been updated successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'Failed to update comment. Please try again.',
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditText('');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!user || !userDoc) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-headline font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground">Please log in to view your profile.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="container mx-auto px-4 py-8 pt-24"
      >
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-3xl font-headline">My Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={userDoc.photoURL} alt={userDoc.name} />
                    <AvatarFallback className="text-2xl">
                      {userDoc.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
                
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Display Name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveProfile} size="sm">
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-2xl font-semibold">{userDoc.name}</h2>
                      <p className="text-muted-foreground">{userDoc.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={userDoc.role === 'admin' ? 'default' : 'secondary'}>
                          {userDoc.role === 'admin' ? 'Admin' : 'User'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs defaultValue="liked" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="liked" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Liked Poems ({likedPoems.length})
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                My Comments ({userComments.length})
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                My Requests ({userRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="liked" className="space-y-4">
              {likedPoems.length > 0 ? (
                <div className="columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3">
                  {likedPoems.map((poetry, index) => (
                    <PoetryCard key={poetry.id} poetry={poetry} index={index} />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">You haven't liked any poems yet.</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              {userComments.length > 0 ? (
                <div className="space-y-4">
                  {userComments.map((comment) => (
                    <Card key={comment.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-sm text-muted-foreground">
                                Comment on "{comment.poetryTitle}"
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditComment(comment.id, comment.text)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                          {editingComment === comment.id ? (
                            <div className="space-y-3">
                              <Textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                placeholder="Edit your comment..."
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveComment(comment.id, comment.poetryId)}
                                >
                                  Save
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm">{comment.text}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">You haven't made any comments yet.</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="requests" className="space-y-4">
              {userRequests.length > 0 ? (
                <div className="space-y-4">
                  {userRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{request.topic}</h4>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="secondary">{request.genre}</Badge>
                                <Badge variant={request.completed ? 'default' : 'outline'}>
                                  {request.completed ? 'Completed' : 'Pending'}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <strong>Mood:</strong> {request.mood}
                          </p>
                          <p className="text-sm">{request.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">You haven't made any requests yet.</p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </motion.main>
    </>
  );
}