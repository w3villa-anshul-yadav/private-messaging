<template>
  <div>
    <div class="left-panel">
      <user v-for="user in users" :key="user.uniqueId" :user="user" :selected="selectedUser === user"
        @select="onSelectUser(user)" />
    </div>
    <message-panel v-if="selectedUser" :user="selectedUser" @input="onMessage" @olderMessage="olderMessage" class="right-panel" />
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
      pageNo: 0,
    };
  },
  methods: {
    onMessage(data) {
      if (this.selectedUser) {
        socket.emit("is_busy", { busyWith: this.selectedUser.uniqueId });
        console.log('> HERE ===========================================socket connected',socket.connected);

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
    olderMessage(){
      let selectedUser = this.users.find(user => user.uniqueId === this.selectedUser.uniqueId);
console.log('> HERE selectedUserselectedUserselectedUser===========================================',selectedUser);
  // Check if the selected user is found
    console.log('> HERE ===========================================selectedUser.messages',selectedUser.messages);
      let time = (selectedUser && selectedUser.messages[0]&& selectedUser.messages[0].data )? selectedUser.messages[0]?.data?.time : null;
    
  console.log('> HERE ===========================================time',time);
      let params = {currentUser: socket.auth.uniqueId, selectedUser: this.selectedUser.uniqueId, limit: 4, pageNo: 1, time: time};
        socket.emit("get_messages",
          params
        );
    },
    onSelectUser(user) {
      this.selectedUser = user;
      user.hasNewMessages = false;
      socket.emit("is_available");
      let selectedUser = this.users.find(user => user.uniqueId === this.selectedUser.uniqueId);

      let time = (selectedUser && selectedUser.messages[0]&& selectedUser.messages[0].data )? selectedUser.messages[0]?.data?.time : null;

      let params = {currentUser: socket.auth.uniqueId, selectedUser: user.uniqueId, limit: 4, pageNo:1, time};
        socket.emit("get_messages",
          params
        );
    },
    
  },
  created() {
    console.log('> HERE !this.selectedUser!this.selectedUser===========================================',!this.selectedUser);
    
    socket.on("connect", () => {
      this.users.forEach((user) => {
        if (user.self) {
          user.connected = true;
        }
      });  
     
      getUser()

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
    let isExpertUser = ()=>{
      return new Promise((resolve)=>{
        let interval = setInterval(()=>{
            let userType  = localStorage.getItem("userType");
            if(userType){
              clearInterval(interval);
              resolve(userType === "expert")
            } 
        },100);
      })
    }
    // Listening for the "users" event from the server, which provides information about users
    let getUser = async () => {
  // Get the unique ID of the current user from the authentication data
  let isExpert = await isExpertUser();
  
  console.log('> HERE ===========================================',isExpert);
  const url = isExpert ? "http://localhost:9090/users/expert-chat-history" : "http://localhost:9090/users/allProfessional";
  const response = await fetch(url, {
    headers: {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjUsImVtYWlsIjoiZXhwZXJ0QGdtYWlsLmNvbSIsImlhdCI6MTcxNTAwMjMwNywiZXhwIjoxNzE3NTk0MzA3fQ.n3BduIkI99YHsjhbb7oES2sckcFZqhm7Z0tWdU7pX5s"
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  let users = (await response.json()).data;

  const currentUserUniqueId = socket.auth.uniqueId;

  // Convert each user object to the required format
  users = users.map(user => {
    return {
      uniqueId: user.uniqueId,
      connected: user.connected,
      userType: isExpert ? 'expert' : 'professional', // Determine userType based on isExpert
      fullName: isExpert ? user.userName : user.name, // Use userName if isExpert, else use name
      userId: user.uniqueId, // Assuming uniqueId can be used as userId
      messages: [] // Initialize messages array
    };
  });

  // Iterate through each user received from the server
  users.forEach((user) => {
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
}
  socket.on("get_messages", (data) => {

  // Find the selected user
  let selectedUser = this.users.find(user => user.uniqueId === this.selectedUser.uniqueId);

  // Check if the selected user is found
  if (selectedUser) {
    
    selectedUser.messages = data.concat(selectedUser.messages);
  }
  
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

    
    socket.on("is_busy", (id) => {
      let user = this.users.find((user) => user.uniqueId === id);
      if (user) {
        console.log('> HERE isBusy received ', user);
        user.isBusy = true;
      } else {
        console.log("User not found:", id);
      }
    });

    socket.on("is_available", (id) => {
      let user = this.users.find((user) => user.uniqueId === id);
      if (user) {
        console.log('> HERE is_available received ', user);
        user.isBusy = false;
      } else {
        console.log("User not found:", id);
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

  
    // window.addEventListener("blur",()=>{
    //   console.log('> HERE ===========================================focus changedfocus changedfocus changed',);
    //   socket.emit("is_available")
    // })
    
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
