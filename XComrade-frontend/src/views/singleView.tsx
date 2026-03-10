import { useNavigate, useParams, useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import { RiArrowGoBackLine } from "react-icons/ri";
import { CiHeart } from 'react-icons/ci';
import { FaHeart, FaRegComment } from 'react-icons/fa';
import type { julkaisuWithRelations, kommentti, tykkäykset, userProfile } from '@xcomrade/types-server';
import { ContentItemOwner, ThreadContentItem } from "../../utilHelpers/types/localTypes";
import { api } from '../../utilHelpers/FetchingData';
import { useKäyttäjä } from '../content/käyttänKontentti';
import { DEFAULT_AVATAR } from '../../utilHelpers/constants';

/** Type guard to distinguish thread content from regular content */
function isThread(content: ContentItemOwner | ThreadContentItem): content is ThreadContentItem {  return 'threadId' in content;
}

/* Recursively renders thread replies */
const ThreadReply = ({ reply, depth = 0 }: { reply: ThreadContentItem; depth?: number }) => (
  <div
    className="border-l-2 border-stone-400/40 pl-4 mt-3"
    style={{ marginLeft: depth > 0 ? '0.5rem' : 0 }}
  >
    <div className="flex items-center gap-2 mb-1">
      {reply.threadOwner.profile_picture_url ? (
        <img
          className="h-6 w-6 rounded-full object-cover"
          src={reply.threadOwner.profile_picture_url}
          alt={reply.threadOwner.käyttäjäTunnus}
        />
      ) : (
        <div className="h-6 w-6 rounded-full bg-stone-500" />
      )}
      <span className="text-sm font-semibold">
        {reply.threadOwner.käyttäjäTunnus || reply.threadOwner.etunimi}
      </span>
      <span className="text-xs text-stone-300">
        {new Date(reply.threadCreatedAt[0]).toLocaleString('fi-FI')}
      </span>
    </div>

    {reply.julkaisuKuvat.length > 0 && (
      <img
        className="max-h-40 w-full rounded object-contain my-1"
        src={reply.julkaisuKuvat[0].image_url}
        alt={reply.kuvaus || reply.otsikko}
      />
    )}

    <p className="text-sm text-stone-100">{reply.kuvaus}</p>

    {reply.replies.length > 0 && (
      <div className="mt-2">
        {reply.replies.map((child) => (
          <ThreadReply key={child.threadId} reply={child} depth={depth + 1} />
        ))}
      </div>
    )}
  </div>
);

const SingleView = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation();
  const { user: currentUser, isAuthenticated } = useKäyttäjä();

  const content = (state as { content?: ContentItemOwner | ThreadContentItem } | null)?.content;

  // Post data fetched from API (includes likes & comments)
  const [post, setPost] = useState<julkaisuWithRelations | null>(null);
  const [likes, setLikes] = useState<tykkäykset[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<(kommentti & { user?: Pick<userProfile, 'id' | 'käyttäjäTunnus' | 'profile_picture_url'> })[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isLoadingPost, setIsLoadingPost] = useState(true);

  // Fetch full post data (likes + comments) using the URL parameter
  useEffect(() => {
    const postId = Number(id);
    if (!postId) return;

    const fetchPostData = async () => {
      setIsLoadingPost(true);
      try {
        const fetchedPost = await api.post.getPost(postId);
        setPost(fetchedPost);
        setLikes(fetchedPost.tykkäykset ?? []);
        setComments(fetchedPost.kommentit ?? []);

        if (isAuthenticated) {
          const likeStatus = await api.like.isPostLiked(postId);
          setIsLiked(likeStatus.success);
        }
      } catch (err) {
        console.error('Failed to fetch post:', err);
      } finally {
        setIsLoadingPost(false);
      }
    };
    fetchPostData();
  }, [id, isAuthenticated]);

  const handleLike = async () => {
    if (!isAuthenticated || !id) return;
    const postId = Number(id);
    const userId = currentUser?.id ?? 0;

    // Optimistic update
    if (isLiked) {
      setIsLiked(false);
      setLikes(prev => prev.filter(l => l.userId !== userId));
      try {
        await api.like.unlikePost(postId);
      } catch {
        setIsLiked(true);
        setLikes(prev => [...prev, { id: Date.now(), julkaisuId: postId, userId }]);
      }
    } else {
      setIsLiked(true);
      setLikes(prev => [...prev, { id: Date.now(), julkaisuId: postId, userId }]);
      try {
        await api.like.likePost(postId);
      } catch {
        setIsLiked(false);
        setLikes(prev => prev.filter(l => l.userId !== userId));
      }
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !id) return;
    const postId = Number(id);
    try {
      const newComment = await api.comment.addComment(postId, commentText);
      setComments(prev => [...prev, newComment as any]);
      setCommentText('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  if (!content && isLoadingPost) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-stone-300">
        <div className="w-9 h-9 border-3 border-white/10 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!content && !post) {
    return (
      <div className="p-4 text-center text-stone-300">
        <p>No content to display.</p>
        <button onClick={() => navigate(-1)} className="mt-2 underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/60 p-4">
      <button
        className="mb-4 flex items-center gap-1 text-stone-200 hover:text-white transition-colors"
        onClick={() => navigate(-1)}
      >
        <RiArrowGoBackLine /> Go back
      </button>

      <article className="mx-auto w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-md bg-stone-600 text-stone-50">

        {/*  Media header (post / video)  */}
        {content && content.contentType.split('-')[0] === 'post' && content.julkaisuKuvat[0] && (
          <img
            className="max-h-[60vh] w-full rounded-t-md object-contain"
            src={content.julkaisuKuvat[0].image_url}
            alt={content.kuvaus || content.otsikko}
          />
        )}
        {content && content.contentType.split('-')[0] === 'video' && content.julkaisuKuvat[0] && (
          <video
            className="max-h-[60vh] w-full rounded-t-md object-contain"
            src={content.julkaisuKuvat[0].image_url}
            controls
          />
        )}
        {/* Fallback media from fetched post when no router state */}
        {!content && post?.media_images?.[0] && (
          post.media_type?.startsWith('video/')
            ? <video className="max-h-[60vh] w-full rounded-t-md object-contain" src={post.media_images[0].image_url} controls />
            : <img className="max-h-[60vh] w-full rounded-t-md object-contain" src={post.media_images[0].image_url} alt={post.kuvaus || post.kohde} />
        )}

        {/*  Thread header  */}
        {content && isThread(content) && (
          <div className="border-b border-stone-500 bg-stone-700 px-4 py-3">
            <h3 className="text-lg font-bold">{content.threadTitle}</h3>
            <div className="mt-1 flex items-center gap-2 text-sm text-stone-300">
              {content.threadOwner.profile_picture_url ? (
                <img
                  className="h-6 w-6 rounded-full object-cover"
                  src={content.threadOwner.profile_picture_url}
                  alt={content.threadOwner.käyttäjäTunnus}
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-stone-500" />
              )}
              <span>{content.threadOwner.käyttäjäTunnus || content.threadOwner.etunimi}</span>
              <span className="text-xs">
                {new Date(content.threadCreatedAt[0]).toLocaleString('fi-FI')}
              </span>
            </div>

            {content.julkaisuKuvat[0] && (
              <img
                className="mt-3 max-h-[50vh] w-full rounded object-contain"
                src={content.julkaisuKuvat[0].image_url}
                alt={content.kuvaus || content.otsikko}
              />
            )}
          </div>
        )}

        <div className="p-4">
          <h2 className="text-center text-2xl">
            {content?.otsikko || post?.kohde || 'Sisältö'}
          </h2>

          <p className="mt-1 text-sm text-stone-300">
            @{content?.owner.käyttäjäTunnus || post?.user?.käyttäjäTunnus || 'unknown'}
          </p>
          <p className="mt-2 max-w-full">{content?.kuvaus || post?.kuvaus}</p>

          <div className="my-2 rounded-md border border-stone-400 p-2 text-sm">
            <p>
              Posted at {new Date(content?.Date_ajakohta || post?.Date_ajakohta || '').toLocaleString('fi-FI')}{' '}
              by {content?.owner.käyttäjäTunnus || content?.owner.etunimi || post?.user?.käyttäjäTunnus || ''}
            </p>
          </div>

          {/* ---- Likes & Comments actions ---- */}
          <div className="flex items-center gap-4 py-3 border-t border-stone-500">
            <button
              className="flex items-center gap-1 text-sm transition-colors bg-transparent border-none p-0 m-0 cursor-pointer hover:text-pink-400"
              style={{ color: isLiked ? '#ef4444' : 'rgba(255,255,255,0.6)' }}
              onClick={handleLike}
              disabled={!isAuthenticated}
            >
              {isLiked
                ? <FaHeart className="inline-block text-red-500" />
                : <CiHeart className="inline-block" />
              }
              {' '}{likes.length} {likes.length === 1 ? 'like' : 'likes'}
            </button>
            <span className="flex items-center gap-1 text-sm text-white/60">
              <FaRegComment className="inline-block" /> {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </span>
          </div>

          {/* ---- Comments section ---- */}
          <section className="mt-3 border-t border-stone-500 pt-3">
            <h4 className="text-base font-semibold text-stone-200 mb-2">Comments</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-sm text-stone-400">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment) => {
                  const username = comment.user?.käyttäjäTunnus ?? (comment as any).käyttäjäTunnus ?? 'unknown';
                  const avatar = comment.user?.profile_picture_url ?? (comment as any).profile_picture_url ?? '';
                  return (
                    <div key={comment.id} className="flex gap-2 items-start">
                      <img
                        src={avatar || DEFAULT_AVATAR}
                        alt={username}
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                      />
                      <div>
                        <span className="text-indigo-300 text-xs font-medium">@{username}</span>
                        <p className="text-white/80 text-sm mt-0.5">{comment.teksti_kenttä}</p>
                        <small className="text-white/30 text-xs">
                          {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                        </small>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add comment input */}
            {isAuthenticated && (
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-indigo-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <button
                  onClick={handleAddComment}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors cursor-pointer border-none"
                >
                  Post
                </button>
              </div>
            )}
          </section>

          {/* ---- Thread replies ---- */}
          {content && isThread(content) && content.replies.length > 0 && (
            <section className="mt-4">
              <h4 className="mb-2 text-base font-semibold text-stone-200">
                Replies ({content.replies.length})
              </h4>
              {content.replies.map((reply) => (
                <ThreadReply key={reply.threadId} reply={reply} />
              ))}
            </section>
          )}
        </div>
      </article>
    </div>
  );
};

export default SingleView;
