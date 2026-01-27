const UploadView = () => {
  return (
    <>
      <h2>Upload View</h2>
      <p>Welcome to the upload page!
        (Content coming here:
      {/*-->  Create new posts: */}
         -post/julkaisu
         - media uploads kuten:
            * images
            * videos
            * threads
        )
      </p>
    </>
  );
};

const PostDetailView = () => {
  return (
    <>
      <h2>Post Detail View</h2>
      <p>
        Content coming here:
        {/* --> Individual post with comments
        (julkaisuWithRelations, kommentti, tykkäykset)
        */}
      </p>
    </>
  );
};
export {UploadView, PostDetailView };
