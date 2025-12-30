export default function BackgroundVideo() {
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      className="fixed top-0 left-0 object-cover w-full h-full -z-10"
    >
      <source src="/animation-video.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}
