<template>
  <div class="content-board">
    <div class="board">
      <div class="content-faces">
        <div
          v-for="face in faces"
          @click.stop="!facesDejaMise.includes(face.id) && selectFace($event)"
          :key="face.id"
          :class="['face ' + face.id, { disable: stopMise }]"
          :data-face="face.id"
          :title="face.label"
        >
          <template v-for="(mise, index) in misesByPlayer">
            <div
              class="card"
              :class="mise.player.class"
              v-if="mise.face === face.id"
              :key="index"
              @click.stop="
                !chronoIsFinish &&
                  mise.player.id === myPlayerId &&
                  deleteMise($event, mise)
              "
            >
              <span
                class="close-mise"
                v-if="!chronoIsFinish && mise.player.id === myPlayerId"
                @click="deleteMise($event, mise)"
              >
                <i class="fa fa-times" aria-hidden="true"></i>
              </span>
              <span>{{ mise.mise }} €</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import SocketIO from "../services/socketio.service";

export default {
  name: "board",
  emits: ["selectFace"],
  computed: {
    ...mapState({
      // on surveille la fin du chrono
      chronoIsFinish: (state) => state.chrono.chronoIsFinish,
      // on recupere les infos sur les faces possibles (tous les animaux et leurs infos)
      faces: (state) => state.mises.faces,
      // Votre ID player
      myPlayerId: (state) => state.players.player.id,
      // on recupere toutes les mises du player
      misesByPlayer: (state) => state.mises.misesByPlayer,
      // on recupere la data pour ouvrir la popup {action : 'mise'}
      dataToOverlay: (state) => state.overlay.data,
      game: (state) => state.games.game,
    }),
    // var qui nous dit juste si on peut miser ou non
    stopMise() {
      return this.chronoIsFinish || !this.game.gameIsReady;
    },
    // function qui interdit le clic sur une face déjà misée
    facesDejaMise() {
      const mesMises = [];
      this.misesByPlayer.forEach((mise) => {
        if (mise.player.id === this.myPlayerId) {
          mesMises.push(mise.face);
        }
      });
      // on inject le tableau dans un new Set() ca permet de retirer les doublons
      return mesMises;
    },
  },
  watch: {
    stopMise(value) {
      // si la game est ready et qu'on est en mode solo
      // on va dire au CPU de miser
      if (!value) {
        if (this.game.mode === "solo") {
          this.cpuPlay();
        }
      }
    },
  },
  methods: {
    ...mapActions({
      openOverlay: "overlay/openOverlay",
      savePlayerMise: "mises/savePlayerMise",
      deletePlayerMise: "mises/deletePlayerMise",
      calculMise: "players/calculMise",
    }),
    selectFace($event) {
      /**
       * on envoie les data au store pour l'overlay
       */
      $event.stopPropagation();
      this.openOverlay({
        action: "mise",
        face: $event.target.dataset.face,
      });
    },
    deleteMise($event, mise) {
      $event.stopPropagation();
      // on delete la mise dans l'archive des mises total du joueur
      this.deletePlayerMise(mise);

      // Sockets ONLY in multiplayer mode
      if (this.game.mode === "multiplayer") {
        // on averti les autres joueurs que jai remove une mise
        SocketIO.emit("player_removed_mise", {
          id: this.game.roomId,
          data: mise,
        });
      }

      // on save la valeur de la mise en cours dans le store
      this.calculMise({ action: "remove", ...mise });
    },
    cpuPlay() {
      /**CPU DATA */
      const cpu = this.game.playersList.filter(
        (player) => player.id === "cpu"
      )[0];
      /**DICES DATA */
      const faces = this.faces;
      const totalChoices = faces.length;
      const totalFacesToMise = Math.floor(Math.random() * totalChoices) + 1;
      /** MONEY DATA */
      const rangeMise = [
        5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90,
        95, 100,
      ];
      let totalMoney = cpu.totalGains;

      // on get X choix unique qui correspondent aux faces du dés (ex: CPU veut 3 mises, on random 3 uniques faces)
      const cpuChoices = new Set();
      while (cpuChoices.size !== totalFacesToMise) {
        cpuChoices.add(Math.floor(Math.random() * totalChoices) + 1);
      }
      // on loop sur ses X choix et on va miser
      cpuChoices.forEach((choice) => {
        if (totalMoney) {
          // on get un random de mise (ex : 10 ou 25 ou 5 etc)
          let randomRange = Math.floor(Math.random() * rangeMise.length) + 1;
          let randomMise = rangeMise[randomRange - 1];
          if (randomMise > totalMoney) {
            // si la mise, qu'on veut, depasse notre cagnotte, on loop sur un new random acceptable
            while (randomMise > totalMoney) {
              rangeMise.splice(randomRange, 1);
              randomRange = Math.floor(Math.random() * rangeMise.length) + 1;
              randomMise = rangeMise[randomRange - 1];
            }
          }
          totalMoney -= randomMise;

          setTimeout(() => {
            const miseToSend = {
              player: cpu,
              face: faces[choice - 1].id,
              mise: parseInt(randomMise),
            };

            // on STORE dans le tableau de toutes les mises de la partie
            this.savePlayerMise(miseToSend);
          }, 1000 * Math.floor(Math.random() * 20) + 1);
        } else {
          return 0;
        }
      });
    },
  },
  created() {
    this.$nextTick(() => {
      // Sockets ONLY in multiplayer mode
      if (this.game.mode === "multiplayer") {
        // on recupere du BACK, les mises adverses que le BACK nous communique
        SocketIO.on("send_mise_adverse", ({ id, data }) => {
          if (this.game.roomId === id) {
            this.savePlayerMise(data);
          }
        });

        // on recupere du BACK, les mises adverses à remove
        SocketIO.on("send_remove_mise_adverse", ({ id, data }) => {
          if (this.game.roomId === id) {
            this.deletePlayerMise(data);
          }
        });
      }
    });
  },
};
</script>

<style lang="scss">
.content-board {
  perspective: 200px;
  position: fixed;
  inset: 0;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  .board {
    grid-area: board;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    width: 200vw;
    height: 150vh;
    z-index: 1;
    background-image: url("../assets/board/bg.jpg");
    background-size: 20% 100%;
    background-repeat: repeat;
    transform: rotateX(10deg) rotateY(0deg) translate3d(-50vw, -50vh, 50px);
    transform-style: flat;
    .content-faces {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(2, 1fr);
      grid-template-areas:
        "tiger crab pumpkin"
        "fish shrimp chicken";
      width: min(100vw - (1rem + 50px), 60vw);
      min-width: 445px;
      background: #fff;
      border-radius: 15px;
      box-shadow: 0 6px 3px 0 rgba(0, 0, 0, 0.8);
      border: 10px solid var(--orange);
      padding: 1rem;

      @include media-max(515px) {
        min-width: 300px;
        width: min(100vw - 1rem, 90vw);
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(3, 1fr);
        grid-template-areas:
          "tiger crab"
          "pumpkin fish"
          "shrimp chicken";
        // 200px = footer-area height
        transform: translateY(calc(45% - 200px));
      }

      .face {
        position: relative;
        display: flex;
        align-self: center;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        @include aspect-ratio(1, 1);
        height: 100%;
        background-color: #fff;
        background-position: center;
        background-repeat: no-repeat;
        background-size: 60%;
        border: 5px solid #444444;
        border-radius: 50%;
        cursor: pointer;
        overflow: hidden;
        animation: rotateFace 10s infinite linear;

        @keyframes scaleShaddow {
          from {
            box-shadow: 0 0 1px 1px #fff;
          }
          from {
            box-shadow: 0 0 10px 5px #fff;
          }
        }
        @keyframes rotateFace {
          from {
            transform: rotate(0deg);
          }
          from {
            transform: rotate(360deg);
          }
        }

        &.tiger {
          grid-area: tiger;
          background-image: $tiger;
        }
        &.pumpkin {
          grid-area: pumpkin;
          background-image: $pumpkin;
        }
        &.fish {
          grid-area: fish;
          background-image: $fish;
        }
        &.crab {
          grid-area: crab;
          background-image: $crab;
        }
        &.chicken {
          grid-area: chicken;
          background-image: $chicken;
        }
        &.shrimp {
          grid-area: shrimp;
          background-image: $shrimp;
        }

        .card {
          position: absolute;
          display: flex;
          align-items: center;
          flex-direction: column;
          justify-content: center;
          color: #fff;
          border-radius: 50%;
          opacity: 0.9;
          font-family: $font1;
          font-size: 1rem;
          font-weight: normal;
          width: 60px;
          white-space: nowrap;
          overflow: hidden;
          @include aspect-ratio(1, 1);

          @include media-max(700px) {
            width: 40px;
            font-size: 0.6rem;
          }

          &:first-child {
            top: 0;
            left: 50%;
            transform: translateY(-30%) translateX(-50%);
            span {
              &.close-mise {
                top: unset;
                bottom: 0;
              }
            }
          }
          &:nth-child(2) {
            top: 25%;
            right: 0;
            transform: translate(0, -50%) rotate(57deg);
            span {
              &.close-mise {
                top: unset;
                bottom: 0;
              }
            }
          }
          &:nth-child(3) {
            bottom: 25%;
            right: 0;
            transform: translate(5%, 25%) rotate(305deg);
          }
          &:nth-child(4) {
            left: 50%;
            bottom: 0%;
            transform: translate(-50%, 25%);
          }
          &:nth-child(5) {
            bottom: 0;
            left: 15%;
            transform: translate(-50%, -50%) rotate(50deg);
          }
          &:nth-child(6) {
            top: 25%;
            left: 15%;
            transform: translate(-50%, -50%) rotate(-55deg);
            span {
              &.close-mise {
                top: unset;
                bottom: 0;
              }
            }
          }

          span {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);

            &.close-mise {
              top: 5px;
              transform: translateX(-50);
            }
          }
        }

        &.disable {
          pointer-events: none;
          cursor: not-allowed;
          animation: none;
          filter: grayscale(1);
        }
      }
    }
  }
}
</style>
