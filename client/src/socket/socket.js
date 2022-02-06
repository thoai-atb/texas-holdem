import io from "socket.io-client";
export const getSocket = (name, address) => {
  return io(address, {
    query: "name=" + name,
  });
};
