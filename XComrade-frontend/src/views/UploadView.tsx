import type { julkaisu, julkaisuWithRelations } from '@xplorercomrade/types-server';
import { useState, useEffect } from 'react';
import { PostForm } from '../components/Feeds';
import { ImageUpload } from '../components/Uploads';
import { PostCard } from '../components/Feeds';
import { api } from '../../utilHelpers/FetchingData';

const UploadView = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [step, setStep] = useState<'post' | 'images'>('post');

  const handlePostSubmit = async (postData: Partial<julkaisu>) => {
    setIsUploading(true);

    try {
      // First, upload images if any
      let imageUrls: string[] = [];
      if (uploadedImages.length > 0) {
        const uploadedUrls = await api.media.uploadImages(uploadedImages);
        imageUrls = uploadedUrls
          .map((item) => {
            const mediaItem = item as { url?: string; file_url?: string; filename?: string };
            return mediaItem.url ?? mediaItem.file_url ?? mediaItem.filename ?? '';
          })
          .filter(Boolean);
      }

      // Create post with image URLs
      const newPost = await api.post.createPost({
        ...postData,
        media_images: imageUrls.join(','), // Assuming comma-separated URLs
      } as any);

      console.log('Post created:', newPost);
      alert('Post published successfully!');

      // Reset form
      setUploadedImages([]);
      setStep('post');
      // TODO: Navigate to home or post detail
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to publish post');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = (files: File[]) => {
    setUploadedImages(files);
    console.log('Images selected:', files);
  };

  return (
    <div className="upload-view">
      <h2>Create New Post 📸</h2>
      <p>Share your travel experience with the community!</p>

      <div className="upload-steps">
        <button
          className={step === 'post' ? 'active' : ''}
          onClick={() => setStep('post')}
        >
          1. Post Details
        </button>
        <button
          className={step === 'images' ? 'active' : ''}
          onClick={() => setStep('images')}
        >
          2. Add Images ({uploadedImages.length})
        </button>
      </div>

      <div className="upload-content">
        {step === 'post' ? (
          <div className="post-form-container">
            <PostForm onSubmit={handlePostSubmit} />
            <button
              onClick={() => setStep('images')}
              className="next-step-btn"
            >
              Next: Add Images →
            </button>
          </div>
        ) : (
          <div className="image-upload-container">
            <ImageUpload
              onUpload={handleImageUpload}
              maxFiles={10}
              isUploading={isUploading}
            />
            <div className="upload-actions">
              <button onClick={() => setStep('post')}>← Back</button>
              <button
                onClick={() => handlePostSubmit({})}
                disabled={isUploading}
                className="publish-btn"
              >
                {isUploading ? 'Publishing...' : 'Publish Post'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PostDetailView = () => {
  const [post, setPost] = useState<julkaisuWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [postId] = useState(1); // TODO: Get from route params

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      setIsLoading(true);
      const postData = await api.post.getPost(postId);
      setPost(postData);
    } catch (err) {
      console.error('Load post error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (postId: number) => {
    if (!post) return;

    try {
      await api.like.likePost(postId);
      setPost({
        ...post,
        tykkäykset: [...post.tykkäykset, { id: Date.now(), julkaisuId: postId, userId: 0 }],
      });
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleComment = async (postId: number, comment: string) => {
    if (!post) return;

    try {
      const newComment = await api.comment.addComment(postId, comment);
      setPost({
        ...post,
        kommentit: [...post.kommentit, newComment as any],
      });
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="post-detail-view">
        <p>Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-detail-view">
        <h2>Post Not Found</h2>
        <p>The post you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="post-detail-view">
      <button onClick={() => window.history.back()} className="back-btn">
        ← Back
      </button>

      <div className="post-detail-content">
        <PostCard
          post={post}
          onLike={handleLike}
          onComment={handleComment}
        />
      </div>

      <div className="related-posts">
        <h3>More from {post.user.etunimi}</h3>
        {/* TODO: Display related posts from the same user */}
      </div>
    </div>
  );
};

export { UploadView, PostDetailView };
