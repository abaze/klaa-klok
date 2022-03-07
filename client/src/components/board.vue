<template>
  <div class="board">
    <div class="content-faces">
      <div
        v-for="face in faces"
        @click="!facesDejaMise.includes(face.id) && selectFace($event)"
        :key="face.id"
        :class="[
          'face ' + face.id,
          { disable: chronoIsFinish || !game.gameIsReady },
        ]"
        :data-face="face.id"
        :title="face.label"
      >
        <template v-for="(mise, index) in misesByPlayer">
          <div
            class="card"
            :class="mise.player.class"
            v-if="mise.face === face.id"
            :key="index"
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

      // on averti les autres joueurs que jai remove une mise
      SocketIO.emit("player_removed_mise", {
        id: this.game.roomId,
        data: mise,
      });

      // on save la valeur de la mise en cours dans le store
      this.calculMise({ action: "remove", ...mise });
    },
  },
  created() {
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
  },
};
</script>

<style lang="scss" scoped>
.board {
  grid-area: board;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #589745;
  padding: 0.25rem;
  width: 100%;
  height: 100%;
  .content-faces {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
    grid-template-areas:
      "tiger crab pumpkin"
      "fish shrimp chicken";
    width: 100%;

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
      animation: scaleShaddow 2s infinite alternate linear;

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
        font-size: 0.8rem;
        font-weight: bold;
        width: 60px;
        white-space: nowrap;
        overflow: hidden;
        @include aspect-ratio(1, 1);

        @include media-max(700px) {
          width: 40px;
          font-size: 0.6rem;
        }

        &.player-1 {
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
        &.player-2 {
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
        &.player-3 {
          bottom: 25%;
          right: 0;
          transform: translate(5%, 25%) rotate(305deg);
        }
        &.player-4 {
          left: 50%;
          bottom: 0%;
          transform: translate(-50%, 25%);
        }
        &.player-5 {
          bottom: 0;
          left: 15%;
          transform: translate(-50%, -50%) rotate(50deg);
        }
        &.player-6 {
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
        cursor: default;
        animation: none;
        opacity: 0.5;
      }
    }
  }
}
</style>
