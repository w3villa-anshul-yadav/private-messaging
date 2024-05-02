<template>
  <div id="app">
    <header v-if="!!currentUserFullName">
      <h1>{{ userType == "expert" ? "Expert: " + currentUserFullName : currentUserFullName }}</h1>
    </header>
    <select-uniqueId v-if="!uniqueIdAlreadySelected" @input="onUniqueIdSelection" />
    <chat v-else />
  </div>
</template>

<script>
import SelectUniqueId from "./components/SelectUniqueId"; // Corrected component name
import Chat from "./components/Chat";
import socket from "./socket";

export default {
  name: "App",
  components: {
    Chat,
    SelectUniqueId,
  },
  data() {
    return {
      uniqueIdAlreadySelected: false,
      currentUserFullName: "", // New data property for the current user's name
      userType: ""
    };
  },
  methods: {
    onUniqueIdSelection(uniqueId) {
      console.log('> HERE ===========================================uniqueId', uniqueId);
      this.uniqueIdAlreadySelected = true;
      socket.auth = { uniqueId, token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjM3LCJlbWFpbCI6ImFuc2h1bC55YWRhdjEyQHczdmlsbGEuY29tIiwiaWF0IjoxNzEzNTE0ODk1LCJleHAiOjE3MTYxMDY4OTV9.gzxbw7RgIym2cKwOmRdEUqEcnVhmdkKmpHSyvf8w_aA" };
      socket.connect();
    },
  },
  created() {
    const uniqueId = localStorage.getItem("uniqueId");
    const userType = localStorage.getItem("userType");
    const fullName = localStorage.getItem("fullName");

    if (uniqueId && userType && fullName) {
      this.uniqueIdAlreadySelected = true;
      this.currentUserFullName = fullName; // Set current user's name
      this.userType = userType; // Set current user's type

      socket.auth = { uniqueId, userType, fullName, token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjM3LCJlbWFpbCI6ImFuc2h1bC55YWRhdjEyQHczdmlsbGEuY29tIiwiaWF0IjoxNzEzNTE0ODk1LCJleHAiOjE3MTYxMDY4OTV9.gzxbw7RgIym2cKwOmRdEUqEcnVhmdkKmpHSyvf8w_aA" };
      socket.connect();
    }

    socket.on("session", ({ uniqueId, userType, fullName }) => {
      // attach the session ID to the next reconnection attempts
      socket.auth = { uniqueId, userType, fullName };

      this.currentUserFullName = fullName; // Update current user's name
      this.userType = userType; // Update current user's type

      // store it in the localStorage
      localStorage.setItem("uniqueId", uniqueId);
      localStorage.setItem("userType", userType);
      localStorage.setItem("fullName", fullName);
      // save the ID of the user
    });

    socket.on("connect_error", (err) => {
      console.log('> HERE ===================================Error ========', err);
      if (err.message === "invalid username") {
        this.uniqueIdAlreadySelected = false;
      }
    });
    socket.on("exception", (err) => {
      console.log('> HERE ===================================Error ========', err);
    });
  },
  destroyed() {
    socket.off("connect_error");
  },
};
</script>

<style>
body {
  margin: 0;
  background-color: #E1F7F5 !important;
  color: black !important;
}


@font-face {
  font-family: Lato;
  src: "~/public/fonts/Lato-Regular.ttf";
}

#app {
  font-family: Lato, Arial, sans-serif;
  font-size: 17px;
}

header {
    color: white;
    padding: 10px;
    padding-left: 300px;
    text-align: center;
    background-color: #333;
  }
  
  header h1 {
    margin: 0;
}
</style>
