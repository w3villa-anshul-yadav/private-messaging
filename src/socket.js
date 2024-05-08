import { io } from "socket.io-client";

// const URL = "http://44.219.152.181";
const URL = "http://127.0.0.1:9090";
const socket = io(URL, { autoConnect: false });

socket.onAny((event, ...args) => {
  console.log('> HERE received Event', event, args);
  if (event == "users")
    console.table(args[0]);
});

export default socket;
