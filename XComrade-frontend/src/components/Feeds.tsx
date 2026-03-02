import type { julkaisu, julkaisuWithRelations, kommentti, tykkäykset, userProfile } from '@xcomrade/types-server';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowRoundForward } from 'react-icons/io';
import {  CiHeart } from 'react-icons/ci';
import {FaRegComment } from 'react-icons/fa';
import { toContentItem, toThreadItem } from '../../utilHelpers/contentMappers';

/* Post/Feed Components:
  - PostCard      --> Media-style card for the grid feed
  - FeedList      --> Responsive grid of PostCards
  - PostForm      --> Create/edit post form
  - CommentSection --> Comments display and form (kommentti)
  - LikeButton    --> Like functionality (tykkäykset)
*/

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23555'/%3E%3Ccircle cx='50' cy='38' r='18' fill='%23888'/%3E%3Cellipse cx='50' cy='80' rx='30' ry='22' fill='%23888'/%3E%3C/svg%3E";
const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23444'/%3E%3Ctext x='200' y='158' text-anchor='middle' fill='%23888' font-size='18'%3ENo Media%3C/text%3E%3C/svg%3E";

interface PostCardProps {
  post: julkaisuWithRelations;
  onLike: (postId: number) => void;
  onComment: (postId: number, comment: string) => void;
}

const PostCard = ({ post, onLike, onComment }: PostCardProps) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const navigate = useNavigate();

  // Map backend data → display type for SingleView navigation
  const isThread = post.media_type === 'text/thread' || post.otsikko?.startsWith('Thread');
  const hasMedia = post.media_images && post.media_images.length > 0;

  const mappedContent = isThread
    ? toThreadItem(post)
    : toContentItem(post);

  const handleViewFull = () => {
    navigate(`/post/${post.id}`, { state: { content: mappedContent } });
  };

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onComment(post.id, commentText);
      setCommentText('');
    }
  };

  const thumbnailUrl = hasMedia ? post.media_images[0].image_url : PLACEHOLDER_IMG;

  const createdDate = new Date(post.Date_ajakohta).toLocaleString('fi-FI', {
    day: 'numeric', month: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  return (
    <>
      {/* ---- Grid Card ---- */}
      <div
        className="group flex flex-col rounded-xl overflow-hidden
                   bg-white/10 backdrop-blur-sm border border-white/[0.08]
                   hover:border-white/20 hover:shadow-lg hover:-translate-y-0.5
                   transition-all cursor-pointer"
        onClick={() => setShowDetail(true)}
      >
        {/* Thumbnail – skip for threads without media */}
        {(!isThread || hasMedia) && (
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-black/20">
          <img
            src={thumbnailUrl}
            alt={post.kohde}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Overlay badge: media count */}
          {post.media_images && post.media_images.length > 1 && (
            <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
              +{post.media_images.length - 1}
            </span>
          )}
        </div>
        )}

        {/* Card body */}
        <div className="flex flex-col flex-1 p-4 gap-1">
          <h3 className="text-white font-semibold text-base truncate">{post.kohde}</h3>
          <p className="text-white/70 font-medium text-sm line-clamp-2">{post.kuvaus}</p>

          {/* Info box */}
          <div className="mt-2 rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs text-white/60 space-y-0.5">
            <p><span className="text-white/40">Created at:</span> {createdDate}</p>
            <p><span className="text-white/40">Owner:</span> {post.user?.käyttäjäTunnus ?? 'Unknown'}</p>
            {post.list_aktiviteetti && post.list_aktiviteetti.length > 0 && (
              <p><span className="text-white/40">Activities:</span> {Array.isArray(post.list_aktiviteetti) ? post.list_aktiviteetti.join(', ') : post.list_aktiviteetti}</p>
            )}
          </div>

          {/* Actions row */}
          <div className="flex items-center gap-3 mt-3 pt-2 border-t border-white/10">
            <button
              className="flex items-center gap-1 text-xs text-white/60 hover:text-pink-400 transition-colors bg-transparent border-none p-0 m-0 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); onLike(post.id); }}
            >
              <CiHeart className="inline-block" /> {post.tykkäykset.length}
            </button>
            <button
              className="flex items-center gap-1 text-xs text-white/60 hover:text-blue-400 transition-colors bg-transparent border-none p-0 m-0 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); setShowDetail(true); }}
            >
              <FaRegComment className="inline-block" /> {post.kommentit.length}
            </button>
            <span className="ml-auto text-xs text-white/40 flex items-center gap-1">
              <img
                src={post.user?.profile_picture_url || DEFAULT_AVATAR}
                alt=""
                className="w-4 h-4 rounded-full object-cover inline-block"
              />
              {post.user?.etunimi ?? 'Unknown'}
            </span>
          </div>

          {/* View Full Post link */}
          <button
            className="flex items-center justify-center gap-1 w-full mt-1 py-1.5 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-white/5 transition-colors bg-transparent border-none rounded-b-xl cursor-pointer"
            onClick={(e) => { e.stopPropagation(); handleViewFull(); }}
          >
            Click to view Full Post <IoMdArrowRoundForward className="inline-block" />
          </button>
        </div>
      </div>

      {/* ---- Detail Modal ---- */}
      {showDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => { setShowDetail(false); setShowComments(false); }}
        >
          <div
            className="bg-[#1e1e2e] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Media carousel */}
            {post.media_images && post.media_images.length > 0 && (
              <div className="w-full max-h-[50vh] overflow-hidden bg-black/40">
                <img
                  src={post.media_images[0].image_url}
                  alt={post.kohde}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={post.user?.profile_picture_url || DEFAULT_AVATAR}
                  alt={post.user?.käyttäjäTunnus ?? 'user'}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-white text-sm font-semibold">{post.user?.etunimi ?? ''} {post.user?.sukunimi ?? ''}</h4>
                  <p className="text-white/50 text-xs">@{post.user?.käyttäjäTunnus ?? 'unknown'}</p>
                </div>
                <span className="ml-auto text-white/40 text-xs">{createdDate}</span>
              </div>

              <h2 className="text-white text-xl font-bold mb-1">{post.kohde}</h2>
              <p className="text-white/80 text-sm mb-3">{post.kuvaus}</p>

              {post.list_aktiviteetti && post.list_aktiviteetti.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(Array.isArray(post.list_aktiviteetti) ? post.list_aktiviteetti : []).map((a, i) => (
                    <span key={i} className="text-xs bg-indigo-600/30 text-indigo-300 px-2 py-0.5 rounded-full">{a}</span>
                  ))}
                </div>
              )}

              {/* Additional images */}
              {post.media_images && post.media_images.length > 1 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {post.media_images.slice(1).map((img) => (
                    <img key={img.id} src={img.image_url} alt="" className="w-full aspect-square object-cover rounded-lg" />
                  ))}
                </div>
              )}

              {/* Like & Comment buttons */}
              <div className="flex items-center gap-4 py-3 border-t border-white/10">
                <button
                  className="text-sm text-white/60 hover:text-pink-400 transition-colors bg-transparent border-none p-0 m-0 cursor-pointer"
                  onClick={() => onLike(post.id)}
                >
                  <CiHeart className="inline-block" /> {post.tykkäykset.length} likes
                </button>
                <button
                  className="text-sm text-white/60 hover:text-blue-400 transition-colors bg-transparent border-none p-0 m-0 cursor-pointer"
                  onClick={() => setShowComments(!showComments)}
                >
                  <FaRegComment className="inline-block" /> {post.kommentit.length} comments
                </button>
              </div>

              {/* Comments section */}
              {showComments && (
                <div className="mt-3 border-t border-white/10 pt-3">
                  <CommentSection comments={post.kommentit} />
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-indigo-500"
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                    />
                    <button
                      onClick={handleSubmitComment}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors cursor-pointer border-none"
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/70 border-none flex items-center justify-center cursor-pointer text-lg"
              onClick={() => { setShowDetail(false); setShowComments(false); }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

interface CommentSectionProps {
  comments: (kommentti & { user: Pick<userProfile, 'id' | 'käyttäjäTunnus' | 'profile_picture_url'> })[];
}

const CommentSection = ({ comments }: CommentSectionProps) => {
  return (
    <div className="space-y-3 max-h-60 overflow-y-auto">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-2 items-start">
          <img
            src={comment.user.profile_picture_url || DEFAULT_AVATAR}
            alt={comment.user.käyttäjäTunnus}
            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
          />
          <div>
            <span className="text-indigo-300 text-xs font-medium">@{comment.user.käyttäjäTunnus}</span>
            <p className="text-white/80 text-sm mt-0.5">{comment.teksti_kenttä}</p>
            <small className="text-white/30 text-xs">{new Date(comment.createdAt).toLocaleDateString()}</small>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
