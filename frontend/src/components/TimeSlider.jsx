export function TimeSlider({ frames, value, onChange }) {
  const currentFrame = frames[value];

  return (
    <div className="slider-wrap">
      <input
        className="time-slider"
        type="range"
        min="0"
        max={Math.max(frames.length - 1, 0)}
        step="1"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />

      <div className="slider-labels">
        <span>{frames[0]?.label}</span>
        <strong>{currentFrame?.label}</strong>
        <span>{frames[frames.length - 1]?.label}</span>
      </div>
    </div>
  );
}
