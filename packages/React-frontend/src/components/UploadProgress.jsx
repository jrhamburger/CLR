import "../styles/UploadProgress.css";

// Counts finished files, not bytes: Supabase's upload() doesn't report byte progress
function UploadProgress({ done, total }) {
  const percent = (done / total) * 100;

  return (
    <div className="upload-progress" role="status">
      <p>Uploading {Math.min(done + 1, total)} of {total}…</p>
      <div className="upload-progress-track">
        <div className="upload-progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default UploadProgress;
