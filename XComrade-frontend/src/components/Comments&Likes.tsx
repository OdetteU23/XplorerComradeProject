import { CiHeart } from 'react-icons/ci';
import { FaHeart } from 'react-icons/fa';
import {CommentSectionProps, LikeButtonProps} from '../../utilHelpers/types/localTypes';
import { DEFAULT_AVATAR } from '../../utilHelpers/constants';

/* Comment & Like UI Components
   - CommentSection --> Comments display list (kommentti)
   - LikeButton     --> Like toggle button (tykkäykset)
   Hooks handling comments & likes logic live in views/commentsLikes.tsx
*/



const CommentSection = ({ comments }: CommentSectionProps) => {
  return (
    <div className="space-y-3 max-h-60 overflow-y-auto">
      {comments.map((comment) => {
        // Handle both nested user object and flat user fields
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
              <small className="text-white/30 text-xs">{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}</small>
            </div>
          </div>
        );
      })}
    </div>
  );
};


const LikeButton = ({ postId, likes, currentUserId, onLike }: LikeButtonProps) => {
  const isLiked = likes.some(like => like.userId === currentUserId);

  return (
    <button
      className={`flex items-center gap-1 text-sm transition-colors bg-transparent border-none p-0 m-0 cursor-pointer ${isLiked ? 'text-red-500' : 'text-white/60 hover:text-pink-400'}`}
      onClick={() => onLike(postId)}
    >
      {isLiked ? <FaHeart className="inline-block text-red-500" /> : <CiHeart className="inline-block" />} {likes.length}
    </button>
  );
};

export { CommentSection, LikeButton };
