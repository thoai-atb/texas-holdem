import tetLight from "../../../assets/texture/tet-lights.png";

export function DecorationTet() {
  return (
    <>
      <LightLineLeftTet />
      <LightLineRightTet />
    </>
  );
}

export function LightLineLeftTet() {
  return (
    <div
      className="absolute opacity-80 top-6 left-0 -scale-x-150 scale-y-150"
      style={{
        width: "15rem",
        height: "15rem",
        backgroundImage: `url(${tetLight})`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <div
        className="absolute bg-opacity-20 bg-yellow-500 top-0 left-0 blur-3xl -translate-y-1/4 rounded-full"
        style={{
          width: "100%",
          height: "200%",
        }}
      ></div>
    </div>
  );
}

export function LightLineRightTet() {
  return (
    <div
      className="absolute opacity-80 top-6 right-0 scale-x-150 scale-y-150"
      style={{
        width: "15rem",
        height: "15rem",
        backgroundImage: `url(${tetLight})`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <div
        className="absolute bg-opacity-20 bg-yellow-500 top-0 left-0 blur-3xl -translate-y-1/4 rounded-full"
        style={{
          width: "100%",
          height: "200%",
        }}
      ></div>
    </div>
  );
}
