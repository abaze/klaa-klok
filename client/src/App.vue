<template>
  <router-view />
</template>

<script>
import SocketIO from "./services/socketio.service.js";
import { mapActions } from "vuex";

export default {
  methods: {
    ...mapActions({
      setPlayerID: "players/setPlayerID",
      addNewRoom: "games/addNewRoom",
    }),
  },
  created() {
    //A l'arrivée d'un player...
    // on lui set son ID (sans username)
    SocketIO.on("new_connection", (id) => {
      this.setPlayerID(id);
    });
  },
};
</script>

<style lang="scss"></style>
