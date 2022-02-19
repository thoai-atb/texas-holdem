import React from "react";

export default function LoginPage({ loginFunction }) {
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const login = () => {
    if (!name) {
      alert("Display name cannot be empty!");
      return;
    }
    const failHandler = () => {
      setBusy(false);
    };
    loginFunction(name, address || "/", failHandler);
    setBusy(true);
  };
  const onKeyDown = (event) => {
    if (event.key === "Enter") {
      login();
    }
  };
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      onKeyDown={onKeyDown}
    >
      <div
        className="bg-white rounded-xl flex flex-col"
        style={{ width: "40rem", height: "20rem" }}
      >
        <div className="text-center p-4 uppercase text-3xl font-bold text-gray-700">
          Connect To Server
        </div>
        <div className="flex-1 items-center justify-around flex flex-col">
          <div className="px-4 flex w-full">
            <p className="p-4 capitalize font-bold text-gray-700 text-xl w-48">
              Display Name
            </p>
            <input
              className="flex-1 mt-2 h-12 bg-gray-200 outline-none text-2xl rounded-lg p-4"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="px-4 flex w-full">
            <p className="p-4 capitalize font-bold text-gray-700 text-xl w-48">
              Server Address
            </p>
            <input
              className="flex-1 mt-2 h-12 bg-gray-200 outline-none text-2xl rounded-lg p-4"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>
        <div className="p-4 flex">
          <button
            className={
              "w-full h-12 bg-gray-700 text-white font-bold text-2xl capitalize rounded-lg p-4 flex items-center justify-center" +
              (busy ? " opacity-50" : "")
            }
            onClick={() => login()}
            disabled={busy}
          >
            {busy ? "Connecting..." : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
}
