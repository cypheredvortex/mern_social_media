const MediaItem = ({ media }) => (
  <div className="p-2">
    {media.type === "image" ? (
      <img src={media.url} alt="" className="rounded shadow" />
    ) : (
      <video controls className="rounded shadow">
        <source src={media.url} />
      </video>
    )}
  </div>
);

export default MediaItem;