<template>
  <div>
    <div class="left-panel">
      <user v-for="user in users" :key="user.uniqueId" :user="user" :selected="selectedUser === user"
        @select="onSelectUser(user)" />
    </div>
    <message-panel v-if="selectedUser" :user="selectedUser" @input="onMessage" class="right-panel" />
  </div>
</template>

<script>
import socket from "../socket";
import User from "./User";
import MessagePanel from "./MessagePanel";

export default {
  name: "Chat",
  components: { User, MessagePanel },
  data() {
    return {
      selectedUser: null,
      users: [],
    };
  },
  methods: {
    onMessage(data) {
      if (this.selectedUser) {
        socket.emit("is_busy", { busyWith: this.selectedUser.uniqueId });
        socket.emit("private_message", {
          data,
          to: this.selectedUser.uniqueId,
        });
        
        this.selectedUser.messages.push({
          data,
          fromSelf: true,
        });
      }

    },
    onSelectUser(user) {
      this.selectedUser = user;
      user.hasNewMessages = false;
    },
  },
  created() {
    socket.on("connect", () => {
      this.users.forEach((user) => {
        if (user.self) {
          user.connected = true;
        }
      });
    });

    socket.on("disconnect", () => {
      this.users.forEach((user) => {
        if (user.self) {
          user.connected = false;
        }
      });
    });

    const initReactiveProperties = (user) => {
      user.hasNewMessages = false;
      user.isBusy = false; // Initialize isBusy property

    };

    // Listening for the "users" event from the server, which provides information about users
    socket.on("users", (users) => {
      // Get the unique ID of the current user from the authentication data
      let currentUserUniqueId = socket.auth.uniqueId;
      console.log('> HERE ===========================================currentUserUniqueId', currentUserUniqueId);

      // Iterate through each user received from the server
      users.forEach((user) => {
        // Iterate through each message of the user
        user.messages.forEach((message) => {
          // Determine if the message is sent by the current user
          message.fromSelf = message.from === currentUserUniqueId;
        });

        // Find if the user already exists in the local users array
        let existingUserIndex = this.users.findIndex((existingUser) => existingUser.uniqueId === user.uniqueId);
        if (existingUserIndex !== -1) {
          // If the user already exists, update its properties
          const existingUser = this.users[existingUserIndex];
          existingUser.connected = user.connected;
          existingUser.messages = user.messages;
        } else {
          // If the user doesn't exist, add it to the local users array
          user.self = user.uniqueId === currentUserUniqueId; // Mark if the user is the current user
          initReactiveProperties(user); // Initialize reactive properties for the user
          this.users.push(user); // Add the user to the local users array
        }
      });

      // Sort the users array
      // The current user is sorted first, followed by others sorted by uniqueId
      this.users.sort((a, b) => {
        if (a.self) return -1; // Current user comes first
        if (b.self) return 1; // Current user comes first
        if (a.uniqueId < b.uniqueId) return -1; // Sort users by uniqueId
        return a.uniqueId > b.uniqueId ? 1 : 0;
      });
    });

    socket.on("user_connected", (user) => {
      let existingUser = this.users.find((existingUser) => existingUser.uniqueId === user.uniqueId);
      if (existingUser) {
        existingUser.connected = true;
      } else {
        initReactiveProperties(user);
        this.users.push(user);
      }
    });

    socket.on("user_disconnected", (id) => {
      let user = this.users.find((user) => user.uniqueId === id);
      if (user) {
        user.connected = false;
      }
    });

    socket.on("older_messages", (data) => {
      console.log('> HERE ===========================================older_messages data', data);
    })
    socket.on("is_busy", (id) => {
      let user = this.users.find((user) => user.uniqueId === id);
      if (user) {
        console.log('> HERE isBusy received ', user);
        user.isBusy = true;
      } else {
        console.log("User not found:", id);
        // Handle the case where the user is not found in the users array
        // This might happen if the user disconnected before setting busy status
      }
    });

    socket.on("private_message", ({ data, from, to }) => {
      let currentUserUniqueId = socket.auth.uniqueId;

      let user = this.users.find((user) => user.uniqueId === (currentUserUniqueId === from ? to : from));
      if (user) {
        user.messages.push({
          data,
          fromSelf: currentUserUniqueId === from,
        });
        if (user !== this.selectedUser) {
          user.hasNewMessages = true;
        }
      }
    });


  },
  destroyed() {
    socket.off("connect");
    socket.off("disconnect");
    socket.off("users");
    socket.off("user_connected");
    socket.off("user_disconnected");
    socket.off("private_message");
  },
};
</script>

<style scoped>
.left-panel {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 300px;
  overflow-x: hidden;
  background-color: #444753;
  color: black;
}

.right-panel {
  margin-left: 300px;
}
</style>
