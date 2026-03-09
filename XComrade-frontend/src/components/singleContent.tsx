import { ContentItemOwner, ThreadContentItem } from "../../utilHelpers/types/localTypes";

/** Type guard to distinguish thread content from regular content */
function isThread(content: ContentItemOwner | ThreadContentItem): content is ThreadContentItem {
  return 'threadId' in content;
}

/** Recursively renders thread replies */
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

    {/* Nested replies */}
    {reply.replies.length > 0 && (
      <div className="mt-2">
        {reply.replies.map((child) => (
          <ThreadReply key={child.threadId} reply={child} depth={depth + 1} />
        ))}
      </div>
    )}
  </div>
);

const SingleContent = (props: {
  content: ContentItemOwner | ThreadContentItem | undefined;
  setSelectedContent: (content: ContentItemOwner | ThreadContentItem | undefined) => void;
}) => {
  const { content, setSelectedContent } = props;

  if (!content) return null;

  return (
    <dialog
      open
      className="inset-0 m-0 grid h-screen w-screen place-items-center border-0 bg-black/60 p-4"
    >
      <article className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-md bg-stone-600 text-stone-50">

        {/* ---- Media header (post / video) ---- */}
        {content.contentType.split('-')[0] === 'post' && content.julkaisuKuvat[0] && (
          <img
            className="max-h-[60vh] w-full rounded-t-md object-contain"
            src={content.julkaisuKuvat[0].image_url}
            alt={content.kuvaus || content.otsikko}
          />
        )}
        {content.contentType.split('-')[0] === 'video' && content.julkaisuKuvat[0] && (
          <video
            className="max-h-[60vh] w-full rounded-t-md object-contain"
            src={content.julkaisuKuvat[0].image_url}
            controls
          />
        )}

        {/* ---- Thread header ---- */}
        {isThread(content) && (
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

            {/* Thread main image if present */}
            {content.julkaisuKuvat[0] && (
              <img
                className="mt-3 max-h-[50vh] w-full rounded object-contain"
                src={content.julkaisuKuvat[0].image_url}
                alt={content.kuvaus || content.otsikko}
              />
            )}
          </div>
        )}

        {/* ---- Body ---- */}
        <div className="p-4">
          <h2 className="text-center text-2xl">{content.otsikko || 'Sisältö'}</h2>

          <p className="mt-1 text-sm text-stone-300">
            @{content.owner.käyttäjäTunnus}
          </p>
          <p className="mt-2 max-w-full">{content.kuvaus}</p>

          <div className="my-2 rounded-md border border-stone-400 p-2 text-sm">
            <p>
              Posted at {new Date(content.Date_ajakohta).toLocaleString('fi-FI')}{' '}
              by {content.owner.käyttäjäTunnus || content.owner.etunimi}
            </p>
          </div>

          {/* ---- Thread replies ---- */}
          {isThread(content) && content.replies.length > 0 && (
            <section className="mt-4">
              <h4 className="mb-2 text-base font-semibold text-stone-200">
                Replies ({content.replies.length})
              </h4>
              {content.replies.map((reply) => (
                <ThreadReply key={reply.threadId} reply={reply} />
              ))}
            </section>
          )}

          <button
            className="mt-4 block w-full rounded bg-stone-500 p-2 text-center transition-all duration-500 ease-in-out hover:bg-stone-700"
            onClick={() => setSelectedContent(undefined)}
          >
            Close
          </button>
        </div>
      </article>
    </dialog>
  );
};

export default SingleContent;
