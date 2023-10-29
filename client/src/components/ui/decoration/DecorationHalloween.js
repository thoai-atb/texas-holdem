import halloweenLight from "../../../assets/texture/halloween-lights.png";

export function DecorationHalloween() {
  return (
    <>
      <LightLineLeftHalloween />
      <LightLineRightHalloween />
    </>
  );
}

export function LightLineLeftHalloween() {
  return (
    <div
      className="absolute opacity-80 top-0 left-0 -scale-x-100"
      style={{
        width: "15rem",
        height: "15rem",
        backgroundImage: `url(${halloweenLight})`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <div
        className="absolute bg-opacity-20 bg-orange-500 top-0 left-0 blur-3xl -translate-y-1/4 rounded-full"
        style={{
          width: "100%",
          height: "200%",
        }}
      ></div>
    </div>
  );
}

export function LightLineRightHalloween() {
  return (
    <div
      className="absolute opacity-80 top-0 right-0"
      style={{
        width: "15rem",
        height: "15rem",
        backgroundImage: `url(${halloweenLight})`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <div
        className="absolute bg-opacity-20 bg-orange-500 top-0 left-0 blur-3xl -translate-y-1/4 rounded-full"
        style={{
          width: "100%",
          height: "200%",
        }}
      ></div>
    </div>
  );
}
