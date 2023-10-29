import lightLineChristmas from "../../../assets/texture/christmas-lights.png";

export function DecorationChristmas() {
  return (
    <>
      <LightLineLeftChristmas />
      <LightLineRightChristmas />
    </>
  );
}

export function LightLineLeftChristmas() {
  return (
    <div
      className="absolute -rotate-45 opacity-80 -translate-x-60 top-0 left-0"
      style={{
        width: "40rem",
        height: "10rem",
        backgroundImage: `url(${lightLineChristmas})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="absolute bg-opacity-20 bg-red-500 top-0 left-0 blur-3xl -translate-y-1/4 rounded-full"
        style={{
          width: "100%",
          height: "200%",
        }}
      ></div>
    </div>
  );
}

export function LightLineRightChristmas() {
  return (
    <div
      className="absolute opacity-80 rotate-45 translate-x-60 top-0 right-0"
      style={{
        width: "40rem",
        height: "10rem",
        backgroundImage: `url(${lightLineChristmas})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="absolute bg-opacity-25 bg-lime-500 top-0 left-0 blur-3xl -translate-y-1/4 rounded-full"
        style={{
          width: "100%",
          height: "200%",
        }}
      ></div>
    </div>
  );
}
