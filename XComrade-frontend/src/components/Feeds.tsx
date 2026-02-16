import type { julkaisu, julkaisuWithRelations, kommentti, tykkäykset, userProfile, media_images } from '@xplorercomrade/types-server';
import { useState } from 'react';

/* Post/Feed Components:
  - PostCard,
  - FeedList/postlists,
  - PostForm(Create/edit post form)
  - CommentSection--> Comments display and form (kommentti)
  - LikeButton --> Like functionality (tykkäykset)
*/

interface PostCardProps {
  post: julkaisuWithRelations;
  onLike: (postId: number) => void;
  onComment: (postId: number, comment: string) => void;
}

const PostCard = ({ post, onLike, onComment }: PostCardProps) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onComment(post.id, commentText);
      setCommentText('');
    }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <img
          src={post.user.profile_picture_url || '/default-avatar.png'}
          alt={post.user.käyttäjäTunnus}
          className="user-avatar"
        />
        <div>
          <h4>{post.user.etunimi} {post.user.sukunimi}</h4>
          <p className="username">@{post.user.käyttäjäTunnus}</p>
        </div>
      </div>

      <div className="post-content">
        <h3>{post.kohde}</h3>
        <p>{post.kuvaus}</p>
        <div className="activities">
          {post.list_aktiviteetti.map((activity, index) => (
            <span key={index} className="activity-chip">{activity}</span>
          ))}
        </div>
      </div>

      {post.media_images && post.media_images.length > 0 && (
        <div className="post-images">
          {post.media_images.map((image) => (
            <img key={image.id} src={image.image_url} alt="Post media" />
          ))}
        </div>
      )}

      <div className="post-actions">
        <button onClick={() => onLike(post.id)}>
           {post.tykkäykset.length}
        </button>
        <button onClick={() => setShowComments(!showComments)}>
           {post.kommentit.length}
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <CommentSection comments={post.kommentit} />
          <div className="comment-form">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
            />
            <button onClick={handleSubmitComment}>Post</button>
          </div>
        </div>
      )}
    </div>
  );
};

interface CommentSectionProps {
  comments: (kommentti & { user: Pick<userProfile, 'id' | 'käyttäjäTunnus' | 'profile_picture_url'> })[];
}

const CommentSection = ({ comments }: CommentSectionProps) => {
  return (
    <div className="comments-list">
      {comments.map((comment) => (
        <div key={comment.id} className="comment-item">
          <img
            src={comment.user.profile_picture_url || '/default-avatar.png'}
            alt={comment.user.käyttäjäTunnus}
            className="comment-avatar"
          />
          <div className="comment-content">
            <span className="comment-username">@{comment.user.käyttäjäTunnus}</span>
            <p>{comment.teksti_kenttä}</p>
            <small>{new Date(comment.createdAt).toLocaleDateString()}</small>
          </div>
        </div>
      ))}
    </div>
  );
};

interface LikeButtonProps {
  postId: number;
  likes: tykkäykset[];
  currentUserId: number;
  onLike: (postId: number) => void;
}

const LikeButton = ({ postId, likes, currentUserId, onLike }: LikeButtonProps) => {
  const isLiked = likes.some(like => like.userId === currentUserId);

  return (
    <button
      className={`like-button ${isLiked ? 'liked' : ''}`}
      onClick={() => onLike(postId)}
    >
      {isLiked ? '' : ''} {likes.length}
    </button>
  );
};

interface PostFormProps {
  onSubmit: (post: Partial<julkaisu>) => void;
  initialData?: Partial<julkaisu>;
}

const PostForm = ({ onSubmit, initialData }: PostFormProps) => {
  const [formData, setFormData] = useState<Partial<julkaisu>>({
    kohde: initialData?.kohde || '',
    kuvaus: initialData?.kuvaus || '',
    list_aktiviteetti: initialData?.list_aktiviteetti || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Destination"
        value={formData.kohde}
        onChange={(e) => setFormData({ ...formData, kohde: e.target.value })}
        required
      />
      <textarea
        placeholder="Share your experience..."
        value={formData.kuvaus}
        onChange={(e) => setFormData({ ...formData, kuvaus: e.target.value })}
        required
      />
      <button type="submit">Post</button>
    </form>
  );
};

interface FeedListProps {
  posts: julkaisuWithRelations[];
  onLike: (postId: number) => void;
  onComment: (postId: number, comment: string) => void;
}

const FeedList = ({ posts, onLike, onComment }: FeedListProps) => {
  return (
    <div className="feed-list">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={onLike}
          onComment={onComment}
        />
      ))}
    </div>
  );
};

export { PostCard, FeedList, PostForm, CommentSection, LikeButton };
export default FeedList;
