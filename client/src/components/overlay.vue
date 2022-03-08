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
            <div class="dices-faces">
              <span
                v-for="face in dicesFaces"
                class="face"
                :class="face"
                :key="'dice-' + face"
              ></span>
            </div>
            <table class="results-table">
              <thead>
                <tr>
                  <th>Joueurs</th>
                  <th class="th-mises">Mises</th>
                  <th>Gains</th>
                  <th>Pertes</th>
                  <th>Soldes</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="score in playersGains"
                  :key="score.player.id"
                  class="result-line"
                  :class="{ active: player.id === score.player.id }"
                >
                  <td>{{ score.player.name }}</td>
                  <td class="detail-mises">
                    <span
                      v-for="mise in score.detailMises"
                      :key="mise.face + '-' + player.id"
                    >
                      <span class="mise-face" :class="mise.face"></span>
                      <span class="mise-money">{{ mise.mise }} €</span>
                    </span>
                  </td>
                  <td class="gains">+ {{ score.gains }} €</td>
                  <td class="pertes">- {{ score.pertes }} €</td>
                  <td>{{ score.totalGains }} €</td>
                </tr>
              </tbody>
            </table>

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
      dicesFaces: (state) => state.dices.chosenFaces,
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

  .tiger {
    background-image: $tiger;
  }
  .pumpkin {
    background-image: $pumpkin;
  }
  .fish {
    background-image: $fish;
  }
  .crab {
    background-image: $crab;
  }
  .chicken {
    background-image: $chicken;
  }
  .shrimp {
    background-image: $shrimp;
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
    }
  }

  .results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    width: 100%;

    .dices-faces {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0.5rem auto;
      .face {
        width: 70px;
        height: 70px;
        aspect-ratio: 1;
        background-color: #fff;
        background-position: center;
        background-repeat: no-repeat;
        background-size: 70%;
        border: 2px solid rgb(240, 109, 1);
        border-radius: 10%;
        margin-right: 0.5rem;
        &:last-of-type {
          margin-right: none;
        }
      }
    }
    .btn {
      margin: 1rem auto;
    }

    .results-table {
      width: 100%;

      th {
        @include media-max(700px) {
          font-size: 0.7rem;
        }

        &.th-mises {
          @include media-max(700px) {
            max-width: 110px;
            flex-wrap: wrap;
          }
        }
      }

      tr.result-line {
        margin: 0;
        border-bottom: 1px solid #fff;
        background-color: rgba(36, 109, 243, 0.4);
        &.active {
          color: yellow;
        }

        td {
          text-align: center;
          @include media-max(700px) {
            font-size: 0.7rem;
            padding: 0;
            margin: 0;
          }

          &.gains {
            color: rgb(21, 201, 75);
          }
          &.pertes {
            color: var(--orange);
          }

          &.detail-mises {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            margin: 0;
            padding: 1rem 0.1rem;
            @include media-max(700px) {
              max-width: 180px;
              margin: auto;
              flex-wrap: wrap;
            }

            & > span {
              display: flex;
              flex-direction: column;
              justify-content: center;
              .mise-face {
                width: 40px;
                height: 40px;
                aspect-ratio: 1;
                background-color: #fff;
                background-position: center;
                background-repeat: no-repeat;
                background-size: 60%;
                border: 1px solid rgb(240, 109, 1);
                border-radius: 10%;
                margin-bottom: 0.2rem;
                @include media-max(700px) {
                  width: 30px;
                  height: 30px;
                  background-size: 80%;
                }
              }
              .mise-money {
                font-size: 0.6rem;
              }
            }
          }
        }
      }
    }
  }
}
</style>
