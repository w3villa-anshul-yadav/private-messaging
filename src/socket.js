import { io } from "socket.io-client";

const URL = "http://localhost:9090";
const socket = io(URL, { autoConnect: false });

socket.onAny((event, ...args) => {
  console.log('> HERE received Event', event, args);
  if (event == "users")
    console.table(args[0]);
});

export default socket;
