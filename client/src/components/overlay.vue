<template>
  <!--Popup visible que si ya des datas-->
  <div v-if="dataToOverlay" class="overlay">
    <div class="content">
      <!-- SI GAMEOVER ET ISWINNER SONT A FALSE : (la game peut se jouer) -->
      <template v-if="!isGameOver && !game.isWinner">
        <div v-if="!chronoIsFinish" class="close-btn" @click="closeOverlay">
          <i class="fa fa-times" aria-hidden="true"></i>
        </div>
        <!-- si chrono pas fini on affiche le content -->
        <template v-if="!chronoIsFinish">
          <form
            class="form-mise"
            v-if="dataToOverlay.action === 'mise' && creditRestant > 0"
            @submit.prevent="sendMise()"
          >
            <div class="face-mise" :class="dataToOverlay.face"></div>
            <label for="input_mise">il vous reste {{ creditRestant }} €</label
            ><br />
            <input
              ref="input_mise"
              id="input_mise"
              type="number"
              v-model="inputMise"
              @load="$refs.input_mise.focus()"
            /><br />
            <input
              class="btn"
              type="submit"
              value="Validation"
              v-show="isMiseValid"
            />
          </form>
          <!-- si player na plus dargent a miser alors on affiche ce message -->
          <p v-else class="alert-msg">
            Vous n'avez plus d'argent à miser...cheh
          </p>
        </template>
        <!-- si chrono fini on affiche le content -->
        <template v-else-if="dataToOverlay.action === 'results'">
          <div class="results">
            <h1>Résultats de la Partie {{ game.gameNumber }}</h1>
            <p class="header" v-if="playersGains">
              <span>Joueurs</span>
              <span>Mises</span>
              <span>Gains</span>
              <span>Pertes</span>
              <span>Soldes</span>
            </p>
            <p
              v-for="score in playersGains"
              :key="score.player.id"
              :class="{ active: player.id === score.player.id }"
            >
              <span>{{ score.player.username }}</span>
              <span>{{ score.mise }} €</span>
              <span class="gains">+ {{ score.gains }} €</span>
              <span class="pertes">- {{ score.pertes }} €</span>
              <span>{{ score.totalGains }} €</span>
            </p>
            <input
              class="btn"
              type="button"
              value="Partie suivante"
              @click="newPartie"
            />
          </div>
        </template>
      </template>
      <!-- SI LA GAME EST OVER OU Y A UN WINNER ALORS -->
      <template v-else>
        <!-- SI GAME OVER GENERAL -->
        <template v-if="isGameOver">
          <h1>GAME OVER !</h1>
          <p>Une belle équipe de winners comme on les aime...</p>
        </template>
        <!-- SI GAME OVER GENERAL -->
        <template v-if="isAWinner.length">
          <h1>
            <span class="orange">{{ isAWinner[0].name }}</span> a gagné !!
          </h1>
          <h2>
            Avec <span class="orange">{{ isAWinner[0].gains }} €</span> dans la
            poche net d'impôts !'
          </h2>
          <p>
            Il mérite tout votre respect à partir d'aujourd'hui bande de
            crevetche !!
          </p>
        </template>
        <button class="btn" @click="restartGame">Recommencer</button>
        <div class="break"></div>
        <a href="/" class="btn-link"> Quitter </a>
      </template>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import SocketIO from "../services/socketio.service.js";
import { useRouter } from "vue-router";

export default {
  name: "overlay",
  data() {
    return {
      inputMise: null,
      winner: {},
      router: useRouter(),
      audioPopup: new Audio(require("@/assets/sounds/popup.mp3")),
      audioGameOver: new Audio(require("@/assets/sounds/game-over.mp3")),
      audioGameWinner: new Audio(require("@/assets/sounds/winner.mp3")),
    };
  },

  computed: {
    ...mapState({
      dataToOverlay: (state) => state.overlay.data,
      chronoIsFinish: (state) => state.chrono.chronoIsFinish,
      misesByPlayer: (state) => state.mises.misesByPlayer,
      totalGains: (state) => state.players.player.totalGains,
      currentMise: (state) => state.players.player.currentMise,
      game: (state) => state.games.game,
      player: (state) => state.players.player,
      playersGains: (state) => state.players.playersGains,
    }),
    ...mapGetters({
      isAWinner: "games/isAWinner",
      isGameOver: "games/isGameOver",
    }),
    creditRestant() {
      return parseInt(this.totalGains - this.currentMise);
    },
    isMiseValid() {
      if (this.inputMise && this.inputMise !== "") {
        return this.inputMise > this.creditRestant || this.inputMise > 0
          ? true
          : false;
      } else {
        return false;
      }
    },
  },
  watch: {
    inputMise(value) {
      if (parseInt(value) > this.creditRestant) {
        this.inputMise = this.creditRestant;
      }
    },
    dataToOverlay(data) {
      if (data) {
        this.audioPopup.volume = 0.2;
        this.audioPopup.play();
      }
    },
    "dataToOverlay.action": function (value) {
      if (value === "mise") {
        this.$nextTick(() => {
          if (this.$refs.input_mise) {
            this.$refs.input_mise.focus();
          }
        });
      }

      if (value === "results") {
        if (this.playersGains.length) {
          const gains = JSON.parse(JSON.stringify(this.playersGains[0]));
          // on Broadcast nos gains aux autres et on reçoit les leurs aussi
          SocketIO.emit("send_my_gains", { id: this.game.roomId, data: gains });
        }
      }
    },
    isGameOver(isGameOver) {
      if (isGameOver) {
        this.audioGameOver.volume = 0.7;
        this.audioGameOver.play();
      }
    },
    isAWinner(isAWinner) {
      if (isAWinner.length > 0) {
        this.audioGameWinner.volume = 0.7;
        this.audioGameWinner.play();
      }
    },
  },
  methods: {
    ...mapActions({
      openOverlay: "overlay/openOverlay",
      savePlayerMise: "mises/savePlayerMise",
      calculMise: "players/calculMise",
      startChrono: "chrono/startChrono",
      initOptions: "games/initOptions",
      prepareNextGame: "games/prepareNextGame",
      addPlayerGains: "players/addPlayerGains",
      majOneFieldPlayersList: "games/majOneFieldPlayersList",
    }),
    closeOverlay() {
      // on kill la popup en lui envoyant des datas à null
      this.openOverlay(null);
      this.inputMise = null;
    },
    sendMise() {
      try {
        const miseToSend = {
          player: this.player,
          face: this.dataToOverlay.face,
          mise: parseInt(this.inputMise),
        };

        // on STORE dans le tableau de toutes les mises de la partie
        this.savePlayerMise(miseToSend);

        // on envoie notre mise au BACK pour que les autres players puisse lafficher sur leur board egalement
        SocketIO.emit("player_mised", {
          id: this.game.roomId,
          data: miseToSend,
        });

        // on save la valeur de la mise en cours dans le store
        // on store la mise courante (on peut add une mise ou en retirer une)
        // ici on ajoute
        this.calculMise({ action: "add", ...miseToSend });

        // on kill la popup
        this.closeOverlay();
      } catch (err) {
        console.log(err);
      }
    },
    newPartie() {
      // close overlay
      this.closeOverlay();
      // on prepare la game suivante
      this.prepareNextGame();
    },
    restartGame() {
      this.initOptions({
        allPlayersAreHere: this.game.allPlayersAreHere,
        gameIsReady: false,
        gameNumber: 0,
        gameOver: false,
        isWinner: false,
        limitPlayers: this.game.limitPlayers,
      });
      this.newPartie();
    },
  },
  mounted() {
    // Quand un player send ses gains, on les reçoit ici
    SocketIO.on("receive_oponent_gains", ({ id, data }) => {
      if (this.game.roomId === id) {
        // on lajoute au STORE pour laffichage popup
        this.addPlayerGains(data);
        // on ajoute maj le totalGains du joueur dans game.playersList (pour le classement général)
        this.majOneFieldPlayersList({
          id: data.player.id,
          field: "totalGains",
          value: data.totalGains,
        });
        // si le player n'a plus d'argent on le met en game over egalement
        if (data.totalGains === 0) {
          this.majOneFieldPlayersList({
            id: data.player.id,
            field: "gameOver",
            value: true,
          });
        }
      }
    });
  },
};
</script>

<style lang="scss">
.overlay {
  display: flex;
  position: fixed;
  inset: 0;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(67, 50, 145, 0.8);
  z-index: 5;
  align-items: center;
  justify-content: center;
  animation: fadeIn 200ms linear;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .close-btn {
    position: absolute;
    top: 0.1rem;
    right: 0.25rem;
    cursor: pointer;
    color: #fff;
    font-size: 2rem;
  }

  .form-mise {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    width: 100%;
    text-align: center;

    .face-mise {
      width: 200px;
      height: 200px;
      aspect-ratio: 1;
      background-color: #fff;
      background-position: center;
      background-repeat: no-repeat;
      background-size: 60%;
      border: 5px solid rgb(240, 109, 1);
      border-radius: 50%;
      margin-bottom: 1rem;

      &.tiger {
        background-image: $tiger;
      }
      &.pumpkin {
        background-image: $pumpkin;
      }
      &.fish {
        background-image: $fish;
      }
      &.crab {
        background-image: $crab;
      }
      &.chicken {
        background-image: $chicken;
      }
      &.shrimp {
        background-image: $shrimp;
      }
    }
  }

  .results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    width: 100%;
    p {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      font-size: 0.8rem;
      margin: 0;
      padding: 1rem 0.5rem;
      border-top: 2px solid #fff;

      &.active {
        background-color: rgba(240, 109, 1, 0.4);
      }

      &.header {
        border-top: none;
      }

      &:last-of-type {
        border-bottom: 2px solid #fff;
      }

      .gains {
        color: rgb(21, 201, 75);
      }
      .pertes {
        color: var(--orange);
      }

      span {
        flex: 1;
      }
    }
    .btn {
      margin: 1rem auto;
    }
  }
}
</style>
