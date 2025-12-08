import MediaItem from "./MediaItem";

const MediaGallery = ({ media }) => (
  <div className="grid grid-cols-3 gap-2">
    {media.map((m) => <MediaItem key={m._id} media={m} />)}
  </div>
);

export default MediaGallery;
