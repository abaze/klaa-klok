<template>
  <div class="box chrono">
    <!-- SI LA PARTIE EST PRETE -->
    <template v-if="game.allPlayersAreHere && game.gameIsReady">
      <template v-if="!chrono.chronoIsFinish">
        <div class="zone-time">
          <img
            src="../assets/board/chrono.png"
            width="60"
            alt="Temps restant : "
          />

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
      <div class="zone-time">
        <img
          src="../assets/board/chrono.png"
          width="60"
          alt="Temps restant : "
        />

        <div class="time">00:{{ chrono.initialChronoLimit }}</div>
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

  font-family: $fontBangers;
  .zone-time {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: clamp(2rem, 2vw, 3.5rem);
    color: #fff;

    .time {
      margin-left: 0.5rem;
    }
  }
}
</style>
