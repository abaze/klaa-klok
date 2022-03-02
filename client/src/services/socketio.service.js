import { io } from "socket.io-client";

let SocketIO = null;

try {
  SocketIO = io(process.env.VUE_APP_SOCKET_ENDPOINT);
} catch (err) {
  console.log(err);
}

export default SocketIO;
