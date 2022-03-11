<template>
  <div class="box dice-area">
    <!-- SI TLM EST CONNNECTE -->
    <template v-if="game.allPlayersAreHere">
      <!-- SI LA GAME EST READY -->
      <template v-if="game.gameIsReady">
        <!-- SI LE CHRONO EST FINISH ON VA LANCER LES DES-->
        <template v-if="chronoIsFinish">
          <!-- ON PREVIENT QUE LE MAINPLAYER VA LANCER LES DES-->
          <p class="msg-info" v-if="game.mainPlayer.id !== player.id">
            {{ game.mainPlayer.name }} va lancer les dés...
            <i class="fa fa-refresh fa-spin fa-fw"></i>
            <span class="sr-only">Loading...</span>
          </p>
          <!-- LE MAINPLAYER VA VOIR LE BOUTON EN PLUS DES DES -->
          <div class="group-dices">
            <dice :face="face1" :throwDice="throwDice" key="des-1" />
            <input
              v-if="game.mainPlayer.id === player.id"
              type="button"
              value="lancez !"
              @click="goPlay"
            />
            <dice :face="face2" :throwDice="throwDice" key="des-2" />
          </div>
        </template>
        <!--  SI LE CHRONO NEST PAS FINISH, ON MISE -->
        <template v-else>
          <div>
            <p class="msg-info">
              <!-- SI ON EST GAME OVER ON REGARDE LES AUTRES JOUER -->
              {{
                player.gameOver
                  ? "GAME OVER..regardez les autres jouer :D"
                  : "À vos mises..."
              }}
              <i class="fa fa-refresh fa-spin fa-fw"></i>
              <span class="sr-only">Loading...</span>
            </p>
          </div>
        </template>
      </template>
      <!-- LA GAME NEST PAS PRETE (LES JOUEURS DOIVENT ETRE TOUS READY) -->
      <template v-else>
        <div>
          <!-- SI JOUEUR PAS PRET ON AFFICHE LE BOUTON -->
          <button v-if="!player.isReady" class="btn glow" @click="playerReady">
            Je suis prêt !
          </button>
          <!-- SINON ON ATTEND LES AUTRES JOEURS -->
          <p v-else class="msg-info">
            Joueurs prêts {{ countPlayersReady }}/{{
              game.playersList.length
            }}...
            <i class="fa fa-refresh fa-spin fa-fw"></i>
            <span class="sr-only">Loading...</span>
          </p>
        </div>
      </template>
    </template>
    <!-- SI IL MANQUE UN JOUEUR-->
    <template v-else>
      <div>
        <p class="msg-info">
          {{ game.playersList.length }}/{{
            game.limitPlayers
          }}&nbsp;&nbsp;joueur{{ plurial }}
          {{ plurial ? "sont" : "est" }} connecté{{ plurial }}
          <i class="fa fa-refresh fa-spin fa-fw"></i>
          <span class="sr-only">Loading...</span>
        </p>
      </div>
    </template>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import SocketIO from "../services/socketio.service";

import dice from "@/components/dice.vue";
export default {
  name: "dice-area",
  components: { dice },
  data() {
    return {
      throwDice: false,
      face1: 0,
      face2: 0,
      audioDices: new Audio(require("@/assets/sounds/dices.mp3")),
    };
  },
  computed: {
    ...mapState({
      chronoIsFinish: (state) => state.chrono.chronoIsFinish,
      throwIsDone: (state) => state.dices.throwIsDone,
      game: (state) => state.games.game,
      player: (state) => state.players.player,
    }),
    plurial() {
      return this.game.playersList.length > 1 ? "s" : "";
    },
    // nous retourne cb de joueur ont le statut Ready à true
    countPlayersReady() {
      return this.game.playersList.filter((player) => player.isReady === true)
        .length;
    },
  },
  watch: {
    // si le nombre de ready === a celui du nombre game.limitPlayers
    countPlayersReady(value) {
      if (value === this.game.limitPlayers) {
        this.startGame();
      }
    },
    "player.isReady": function () {
      // Si statut Ready change, on le send aux autres players
      // on send le player + l'id Room
      SocketIO.emit("my_player_update_ready", {
        id: this.game.roomId,
        data: this.player,
      });
    },
    throwIsDone(isDone) {
      if (isDone) {
        setTimeout(() => {
          this.calculGains();
        }, 2000);
      }
    },
  },
  methods: {
    ...mapActions({
      calculMise: "players/calculMise",
      getChosenFace: "dices/getChosenFace",
      resetChosenFaces: "dices/resetChosenFaces",
      calculGains: "players/calculGains",
      setThrowState: "dices/setThrowState",
      setPlayerIsReady: "players/setPlayerIsReady",
      startGame: "games/startGame",
      majOneFieldPlayersList: "games/majOneFieldPlayersList",
    }),
    playerReady() {
      // Quand le player est ready, on le signale au STORE
      // le watcher va EMIT au BACK
      this.setPlayerIsReady({ value: true, player: this.player });
    },
    goPlay(face1 = null, face2 = null) {
      this.resetChosenFaces();
      // si c'est le mainPlayer qui lance, il init les 2 value randoms des des
      if (this.player.id === this.game.mainPlayer.id) {
        const min = 0;
        const max = 6;
        this.face1 = Math.floor(Math.random() * (max - min) + min);
        this.face2 = Math.floor(Math.random() * (max - min) + min);
        this.throwDice = true;
        SocketIO.emit("you_can_throw_dices", {
          id: this.game.roomId,
          data: {
            face1: this.face1,
            face2: this.face2,
          },
        });
        this.getChosenFace({ face1: this.face1, face2: this.face2 });
      } else {
        // quand les autres players reçoivent les faces, ils ont juste à les inits
        this.face1 = face1;
        this.face2 = face2;
        this.throwDice = true;
        this.getChosenFace({ face1: this.face1, face2: this.face2 });
      }
      this.audioDices.volume = 0.5;
      this.audioDices.play();

      // dans les 2 cas on réinit throwDice à false (pour pouvoir relancer les dés après)
      setTimeout(() => {
        this.throwDice = false;
      }, 3000);
    },
  },
  mounted() {
    // Quand un player a signalé etre ready, on le maj dans notre STORE
    SocketIO.on("one_player_update_ready", ({ id, data }) => {
      if (this.game.roomId === id) {
        this.majOneFieldPlayersList({
          id: data.id,
          field: "isReady",
          value: data.isReady,
        });
      }
    });

    // Quand on recoit les faces du mainPLayer on lance les dés
    SocketIO.on("send_dices_faces", ({ id, data }) => {
      if (this.game.roomId === id) {
        this.goPlay(data.face1, data.face2);
      }
    });
  },
};
</script>

<style lang="scss">
.dice-area {
  font-family: $fontAtma;
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .msg-info {
    font-size: 2rem;
    border-radius: 15px;
    box-shadow: 0 5px 5px 2px rgba(0, 0, 0, 0.7);
    padding: 0.25rem 1rem !important;
    backdrop-filter: blur(2px);
    @include media-max(600px) {
      font-size: 1.4rem;
    }
  }

  .group-dices {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 300px;
    width: 100%;
  }

  input[type="button"] {
    all: unset;
    margin: 0 1rem;
    width: 100px;
    height: 100px;
    background: rgb(199, 27, 27);
    background-size: 200% 200%;
    background-image: linear-gradient(
      40deg,
      rgba(199, 27, 27, 1) 5%,
      rgba(238, 99, 99, 1) 50%,
      rgba(255, 0, 0, 1) 100%
    );
    color: #fff;
    text-transform: uppercase;
    font-weight: 900;
    text-align: center;
    border: 3px solid #fff;
    border-radius: 50%;
    cursor: pointer;
    transition: background-position 0.3s linear;

    &:hover {
      background-position: -50px -100px;
    }

    @include media-max(600px) {
      width: 50px;
      height: 50px;
      font-size: 0.6rem;
      font-weight: 300;
      margin: 0;
    }
  }
}
</style>
