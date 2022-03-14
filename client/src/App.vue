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
      muteAllAudios: "audios/muteAllAudios",
      destroyAudios: "audios/destroyAudios",
    }),
  },
  created() {
    // si on change de fenetre on mute le son sinon on remet
    window.addEventListener("blur", () => {
      this.muteAllAudios(true);
    });
    window.addEventListener("focus", () => {
      this.muteAllAudios(false);
    });

    //A l'arrivée d'un player...
    // on lui set son ID (sans username)
    SocketIO.on("new_connection", (id) => {
      this.setPlayerID(id);
    });
  },

  unmounted() {
    // quand le player leave, on kill tous les sons + window event
    this.destroyAudios();
    window.removeEventListener("blur");
    window.removeEventListener("focus");
  },
};
</script>

<style lang="scss"></style>
