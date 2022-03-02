<template>
  <div class="box chrono">
    <!-- SI LA PARTIE EST PRETE -->
    <template v-if="game.allPlayersAreHere && game.gameIsReady">
      <h1>Partie {{ game.gameNumber }}</h1>
      <template v-if="!chrono.chronoIsFinish">
        <p>Temps restant</p>
        <div class="zone-time">
          <i class="fa fa-clock-o" aria-hidden="true"></i>
          <div class="time">{{ chrono.chrono }}</div>
        </div>
      </template>
      <template v-else>
        <p>Le chrono est terminé !</p>
        <div class="align-self-center">
          <i class="fa fa-refresh fa-spin fa-2x fa-fw"></i>
          <span class="sr-only">Loading...</span>
        </div>
      </template>
    </template>
    <template v-else>
      <h1>Partie en attente</h1>
      <div>
        <i class="fa fa-refresh fa-spin fa-3x fa-fw"></i>
        <span class="sr-only">Loading...</span>
      </div>
    </template>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  name: "chrono",

  data() {
    return {
      audioTimer: new Audio(require("@/assets/sounds/timer.mp3")),
      audioAlarm: new Audio(require("@/assets/sounds/timer-finish.mp3")),
    };
  },

  computed: {
    ...mapState({
      chrono: (state) => state.chrono,
      game: (state) => state.games.game,
    }),
  },
  watch: {
    "game.gameIsReady": {
      deep: true,
      handler(value) {
        console.log("game is ready : ", value);
        if (value) {
          this.startChrono();
          // on lance la musique de fond
          this.audioAlarm.pause();
          this.audioAlarm.currentTime = 0;

          this.audioTimer.volume = 0.1;
          this.audioTimer.loop = true;
          this.audioTimer.play();
        }
      },
    },
    "chrono.chronoIsFinish": function (isFinish) {
      if (isFinish) {
        console.log("on joue Alarme");
        this.audioTimer.pause();
        this.audioTimer.currentTime = 0;
        this.audioAlarm.volume = 0.1;
        this.audioAlarm.play();
      }
    },
  },
  methods: {
    ...mapActions({
      startChrono: "chrono/startChrono",
    }),
  },
};
</script>

<style lang="scss">
.chrono {
  grid-area: chrono;
  background-color: rgb(39, 36, 36);

  .zone-time {
    display: flex;
    align-items: center;
    justify-content: space-around;
    font-size: clamp(2rem, 2vw, 3.5rem);
    color: var(--orange);

    .time {
      margin-left: 0.2rem;
    }
  }
}
</style>
