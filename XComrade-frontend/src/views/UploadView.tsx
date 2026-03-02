import { useState, useRef } from 'react';
import { mediaAPI, api } from '../../utilHelpers/FetchingData';
import { FaImage } from 'react-icons/fa';
import { BsFillThreadsFill } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';


//  form hook for images/contents uploading
function usePostForm(
  onSubmitCallback: () => Promise<void>,
  initialValues: Record<string, any>,
) {
  const [inputs, setInputs] = useState<Record<string, any>>(initialValues);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmitCallback();
  };

  return { handleInputChange, handlePostSubmit, inputs, setInputs };
}


// useReducer for UploadView (reserved for future use)
/*
type UploadStep = 'post' | 'images';
interface UploadState {
  isUploading: boolean;
  uploadedImages: File[];
  step: UploadStep;
  error: string | null;
}

type UploadAction =
  | { type: 'SET_STEP'; payload: UploadStep }
  | { type: 'SET_IMAGES'; payload: File[] }
  | { type: 'UPLOAD_START' }
  | { type: 'UPLOAD_SUCCESS' }
  | { type: 'UPLOAD_ERROR'; payload: string }
  | { type: 'RESET' };


const uploadInitialState: UploadState = {
  isUploading: false,
  uploadedImages: [],
  step: 'post',
  error: null,
};

function uploadReducer(state: UploadState, action: UploadAction): UploadState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SET_IMAGES':
      return { ...state, uploadedImages: action.payload };
    case 'UPLOAD_START':
      return { ...state, isUploading: true, error: null };
    case 'UPLOAD_SUCCESS':
      return { ...state, isUploading: false, uploadedImages: [], step: 'post', error: null };
    case 'UPLOAD_ERROR':
      return { ...state, isUploading: false, error: action.payload };
    case 'RESET':
      return uploadInitialState;
    default:
      return state;
  }
}
 */

const Uploads = () => {
  const [uploadedFiles, setUploadedFiles] = useState<boolean>(false);
  const [uploadedImages, setUploadedImages] = useState<File | null>(null);
  const navigate = useNavigate();

  //HTML element
  const fileRef = useRef<HTMLInputElement | null>(null);

  const inituploadValues = {title: '', description: ''};
  const isUpload = async () => {
    if (!uploadedImages) {
      console.log('Select an image or content to upload');
      return;
    }
    setUploadedFiles(true);
    try {
      // 1. Upload the file to the upload server
      const result = await mediaAPI.uploadFile(uploadedImages);
      console.log('Image uploaded successfully:', result);

      // 2. Create a post in the mediacontent database with the image URL
      const imageUrl = mediaAPI.getFileUrl(result.data.filename);
      await api.post.createPost({
        kohde: inputs.title,
        otsikko: inputs.title,
        kuvaus: inputs.description || inputs.title,
        media_type: uploadedImages.type,   // e.g. 'image/jpeg', 'video/mp4'
        media_images: [imageUrl],
      } as any);

      alert('Post published successfully!');
      resetUpload();
      navigate('/');
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploadedFiles(false);
    }
  };
  const {handleInputChange, handlePostSubmit, inputs, setInputs} = usePostForm(
    isUpload,
    inituploadValues,
    //postContents
  );
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //const images = event.target.files;
    if (event.target.files && event.target.files.length > 0) {
      setUploadedImages(event.target.files[0]);
    }
  };
  const resetUpload = () => {
    setInputs(inituploadValues);
    setUploadedImages(null);

    console.log(fileRef.current?.value);
    if (fileRef.current) {
      fileRef.current.value = '';
    }
  };

  return (
  <>
   <h1 className="text-center text-2xl font-semibold">Upload</h1>
    <form
        onSubmit={handlePostSubmit}
        className="mx-auto mt-4 flex w-full max-w-2xl flex-col gap-4 rounded-md bg-stone-600 p-6 text-stone-50 shadow"
      >
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold" htmlFor="title">
            Title
          </label>
          <input
            className="rounded-md border border-stone-400 bg-stone-700/60 px-3 py-2 text-stone-50 transition outline-none focus:border-stone-200 focus:ring-2 focus:ring-stone-300/40"
            name="title"
            type="text"
            id="title"
            onChange={handleInputChange}
            value={inputs.title}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold" htmlFor="description">
            Description
          </label>
          <textarea
            className="rounded-md border border-stone-400 bg-stone-700/60 px-3 py-2 text-stone-50 transition outline-none focus:border-stone-200 focus:ring-2 focus:ring-stone-300/40"
            name="description"
            rows={5}
            id="description"
            onChange={handleInputChange}
            value={inputs.description}
          ></textarea>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold" htmlFor="file">
            File
          </label>
          <input
            className="block w-full text-sm text-stone-200 file:mr-4 file:rounded-md file:border-0 file:bg-stone-500 file:px-4 file:py-2 file:font-semibold file:text-stone-50 hover:file:bg-stone-700"
            name="file"
            type="file"
            id="file"
            accept="image/*, video/*"
            onChange={handleImageChange}
            ref={fileRef}
          />
        </div>
        <img
          className="mx-auto h-48 w-48 rounded-md object-cover"
          src={
            uploadedImages
              ? URL.createObjectURL(uploadedImages)
              : 'https://placehold.co/320x240?text=Choose+image'
          }
          alt="preview"
          width="200"
        />

        <button
          style={{
            width: '100%',
            borderRadius: '0.375rem',
            padding: '0.5rem 1rem',
            fontWeight: 600,
            border: 'none',
            cursor: uploadedImages && inputs.title.length > 3 ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            backgroundColor: uploadedImages && inputs.title.length > 3 ? '#3b82f6' : '#78716c',
            color: uploadedImages && inputs.title.length > 3 ? '#fff' : '#a8a29e',
            opacity: uploadedImages && inputs.title.length > 3 ? 1 : 0.5,
          }}
          type="submit"
          disabled={!(uploadedImages && inputs.title.length > 3)}
        >
          {uploadedFiles ? 'Uploading...' : 'Upload'}
        </button>
        {(!uploadedImages || inputs.title.length <= 3) && (
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#fde047', marginTop: '0.25rem' }}>
            {!uploadedImages && inputs.title.length <= 3
              ? 'Please add a title (4+ chars) and select a file'
              : !uploadedImages
              ? 'Please select a file to upload'
              : 'Title must be more than 3 characters'}
          </p>
        )}
      </form>
      <div className="mx-auto mt-4 w-full max-w-2xl">
        <button
          className="w-full rounded-md border border-stone-400 bg-transparent px-4 py-2 font-semibold text-stone-50 transition hover:bg-stone-700"
          onClick={resetUpload}
        >
          Reset
        </button>
      </div>
      {uploadedFiles && (
        <p className="mt-3 text-center font-semibold text-stone-50">
          Uploading...
        </p>
      )}
  </>
  )
}
const PostThreadContent = () => {
  //Todo: Implementing just the text content (Threads like contents for users, where they can share their travel stories, and others can comment/like them)
  //The logic is the same as image uploading, but without the file input and preview. The post can be created with text content or with an images/short videos.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const initPostValues = { title: '', description: '' };

  const isPostSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.post.createPost({
        kohde: inputs.title,
        otsikko: `Thread: ${inputs.title}`,
        kuvaus: inputs.description || inputs.title,
        media_type: 'text/thread',        // marks this as a thread post
      } as any);
      alert('Thread posted successfully!');
      setInputs(initPostValues);
      navigate('/');
    } catch (err) {
      console.error('Thread post error:', err);
      alert('Failed to post thread. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const { handleInputChange, handlePostSubmit, inputs, setInputs } = usePostForm(
    isPostSubmit,
    initPostValues,
  );

  return (
    <div className="post-detail-view">
      <h1 className="text-center text-2xl font-semibold">Create a Thread</h1>
      <form
        onSubmit={handlePostSubmit}
        className="mx-auto mt-4 flex w-full max-w-2xl flex-col gap-4 rounded-md bg-stone-600 p-6 text-stone-50 shadow"
      >
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold" htmlFor="thread-title">
            Title
          </label>
          <input
            className="rounded-md border border-stone-400 bg-stone-700/60 px-3 py-2 text-stone-50 transition outline-none focus:border-stone-200 focus:ring-2 focus:ring-stone-300/40"
            name="title"
            type="text"
            id="thread-title"
            placeholder="What's on your mind?"
            onChange={handleInputChange}
            value={inputs.title}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold" htmlFor="thread-description">
            Description
          </label>
          <textarea
            className="rounded-md border border-stone-400 bg-stone-700/60 px-3 py-2 text-stone-50 transition outline-none focus:border-stone-200 focus:ring-2 focus:ring-stone-300/40"
            name="description"
            id="thread-description"
            rows={6}
            placeholder="Share your travel story..."
            onChange={handleInputChange}
            value={inputs.description}
          />
        </div>
        <button
          className="w-full rounded-md bg-stone-500 px-4 py-2 font-semibold transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={inputs.title.length <= 3 || isSubmitting}
        >
          {isSubmitting ? 'Posting...' : 'Post Thread'}
        </button>
        {inputs.title.length > 0 && inputs.title.length <= 3 && (
          <p className="text-center text-sm text-yellow-300">Title must be more than 3 characters</p>
        )}
      </form>
    </div>
  );

};
type UploadTab = 'image' | 'thread';

const tabBaseStyle: React.CSSProperties = {
  flex: 1,
  borderRadius: '0.5rem',
  padding: '0.625rem 1rem',
  fontSize: '0.875rem',
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const tabActiveStyle: React.CSSProperties = {
  ...tabBaseStyle,
  backgroundColor: '#3b82f6',
  color: '#fff',
  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
};

const tabInactiveStyle: React.CSSProperties = {
  ...tabBaseStyle,
  backgroundColor: 'transparent',
  color: '#d6d3d1',
};

const UploadView = () => {
  const [activeTab, setActiveTab] = useState<UploadTab>('image');

  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '1.5rem 1rem', width: '100%' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0.25rem', borderRadius: '0.5rem', backgroundColor: 'rgba(87,83,78,0.6)', padding: '0.25rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('image')}
          style={activeTab === 'image' ? tabActiveStyle : tabInactiveStyle}
        >
          <FaImage style={{ display: 'flex', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '0.5rem' }} /> Image Upload
        </button>
        <button
          onClick={() => setActiveTab('thread')}
          style={activeTab === 'thread' ? tabActiveStyle : tabInactiveStyle}
        >
          <BsFillThreadsFill style={{ display: 'flex', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '0.5rem' }} /> Thread Post
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'image' ? <Uploads /> : <PostThreadContent />}
    </div>
  );
};

export { UploadView, Uploads, PostThreadContent };

