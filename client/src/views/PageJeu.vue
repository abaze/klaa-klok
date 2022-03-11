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
import SocketIO from "../services/socketio.service";
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
      sessionID: null,
      notif: {
        msg: "",
        label: "",
      },
      audioGame: new Audio(require("@/assets/sounds/game.mp3")),
    };
  },
  computed: {
    ...mapState({
      game: (state) => state.games.game,
      playersList: (state) => state.games.game.playersList,
      limitPlayers: (state) => state.games.game.limitPlayers,
      player: (state) => state.players.player,
      gameIsReady: (state) => state.games.game.gameIsReady,
    }),
    quiALaMain() {
      return this.playersList[0];
    },
  },
  watch: {
    playersList: {
      deep: true,
      // on watch la liste des participants pour savoir si tlm est la
      handler(currentList) {
        if (currentList.length == this.limitPlayers) {
          this.allPlayersAreHere(true);
        } else {
          this.allPlayersAreHere(false);
        }
      },
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
    }),
  },
  created() {
    this.$nextTick(() => {
      // ETAPE-1 : On signale au BACK qu'on vient d'arriver dans la room
      SocketIO.emit(
        "player_request_init_room_data",
        this.game.roomId,
        (response) => {
          // ETAPE-2 : le BACK nous envoie toutes les données de cette room (les options, les joueurs dispos)
          // si il y a des datas alors on fait tous les storages
          if (response.data) {
            // on lance la musique dambiance
            this.audioGame.volume = 0.25;
            this.audioGame.loop = true;
            this.audioGame.play();
            // on STORE toute la data pour INIT notre game
            this.initGame(response.data);
            // on va determiner une class pour notre joueur (pour pouvoir lui donner une couleur fixe)
            const prefix = "player-";
            const order = this.playersList.length + 1;
            this.setPlayerClass(prefix.concat(order));
            // on s'ajoute à notre STORE player
            this.addPlayer(this.player);
            // on designe toujours le 1er joueur de la liste comme le maitre du jeu (mainPlayer qui peut lancer les dés)
            // quiALaMain retourne game.playersList[0]
            this.setMainPlayer(this.quiALaMain);
            // on previent le BACK de nous stocker (pour que les autres joueurs puissent nous récupérer d leur arrivée)
            SocketIO.emit(
              "send_my_player",
              {
                id: this.game.roomId,
                data: this.player,
              },
              (response) => {
                if (response) {
                  this.notif.msg = response.msg;
                  this.notif.label = "good";
                  this.addNotification(this.notif);
                }
              }
            );
          } else {
            // si pas de data (donc pas de roomId existant) on redirige vers une page 404
            this.router.push({
              path: "/notfound",
              params: { wrongPath: response.id },
            });
          }
        }
      );

      // ETAPE-3 : si un autre player, que moi, arrive, on lui met dans son STORE et on affiche une notif
      SocketIO.on("new_player_is_coming", ({ id, data }) => {
        if (this.game.roomId === id) {
          this.addPlayer(data);
          this.notif.msg = `${data.name} vient de se connecter`;
          this.notif.label = "good";
          this.addNotification(this.notif);
        }
      });

      // ETAPE-4 : quand un player quitte la partie...
      // on le supprime de notre liste du store
      SocketIO.on("player_leave", ({ id, data }) => {
        if (this.game.roomId === id) {
          this.removePlayer(data);
          // on designe un new mainPlayer
          this.setMainPlayer(this.quiALaMain);
        }
      });
    });
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
