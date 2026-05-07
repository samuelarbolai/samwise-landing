type Props = {
  label: string;
  caption?: string;
};

export function VideoPlaceholder({ label, caption }: Props) {
  return (
    <figure style={{ margin: "20px 0" }}>
      <div
        aria-label={label}
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          border: "1px dashed #999",
          background: "#fafafa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#666",
          fontSize: "0.9rem",
          textAlign: "center",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        {label}
      </div>
      {caption && (
        <figcaption
          style={{
            marginTop: "8px",
            color: "#666",
            fontSize: "0.85rem",
            textAlign: "center",
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
