<template>
  <main role="main">
    <div class="layout">
      <ranking></ranking>
      <board></board>
      <div class="footer-area">
        <dice-area></dice-area>
        <chrono></chrono>
      </div>
      <overlay></overlay>
    </div>
    <notification />
  </main>
</template>

<script>
// components
import ranking from "../components/ranking.vue";
import board from "../components/board.vue";
import diceArea from "../components/dice-area.vue";
import overlay from "../components/overlay.vue";
import chrono from "../components/chrono.vue";
import notification from "../components/notification.vue";

// modules
import { mapState, mapActions } from "vuex";
import { useRouter } from "vue-router";

export default {
  name: "PageJeu",
  components: {
    chrono,
    ranking,
    board,
    diceArea,
    overlay,
    notification,
  },
  data() {
    return {
      router: useRouter(),
      notif: {
        msg: "",
        label: "",
      },
    };
  },
  computed: {
    ...mapState({
      game: (state) => state.games.game,
      playersList: (state) => state.games.game.playersList,
      player: (state) => state.players.player,
      cpuPlayer: (state) => state.players.cpuPlayer,
      gameIsReady: (state) => state.games.game.gameIsReady,
    }),
    quiALaMain() {
      return this.playersList[0];
    },
  },
  methods: {
    ...mapActions({
      initGame: "games/initGame",
      setPlayerClass: "players/setPlayerClass",
      addPlayer: "games/addPlayer",
      removePlayer: "games/removePlayer",
      addNotification: "notifications/addNotification",
      allPlayersAreHere: "games/allPlayersAreHere",
      setMainPlayer: "games/setMainPlayer",
      initAudios: "audios/initAudios",
    }),
  },
  created() {
    this.$nextTick(() => {
      /** DATA POUR LE CPU PLAYER */
      // on ajoute le CPU dans la liste des players
      this.addPlayer(this.cpuPlayer);

      /** DATA POUR NOTRE JOUEUR */
      // on va determiner une class pour notre joueur (pour pouvoir lui donner une couleur fixe)
      const prefix = "player-";
      const order = this.playersList.length + 1;
      this.setPlayerClass(prefix.concat(order));
      // on s'ajoute à notre STORE player
      this.addPlayer(this.player);
      // le Main player initial c'est le 1er player (CPU)
      this.setMainPlayer(this.quiALaMain);
      // on previent le STORE que tt le monde est la
      this.allPlayersAreHere(true);
    });
  },
  mounted() {
    // on init les sons du jeu
    this.initAudios();

    // si au chargement on ne trouve pas de player, on redirige vers une 404
    // pour prevent les refresh de la page en cours de jeu
    if (this.player.name === null) {
      this.router.push("/notfound");
    }
  },
};
</script>

<style lang="scss">
body {
  background-color: var(--green);
}
main {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;

  .layout {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: flex-end;
    .ranking {
      position: fixed;
      right: -5px;
      top: 10px;
      z-index: 3;
    }

    .footer-area {
      display: flex;
      width: 100%;
      align-items: center;
      padding: 1rem;

      @include media-max(900px) {
        flex-direction: column-reverse;
        .chrono {
          margin-bottom: 1rem;
        }
      }
    }
  }
}
</style>
