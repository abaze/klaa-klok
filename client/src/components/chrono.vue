<template>
  <div class="box chrono">
    <!-- SI LA PARTIE EST PRETE -->
    <template v-if="game.allPlayersAreHere && game.gameIsReady">
      <div class="zone-time">
        <img
          src="../assets/board/chrono.svg"
          width="60"
          alt="Temps restant : "
        />

        <div class="time">{{ chrono.chrono }}</div>
      </div>
    </template>
    <template v-else>
      <div class="zone-time">
        <img
          src="../assets/board/chrono.svg"
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
  border-radius: 15px;
  box-shadow: 0 5px 5px 2px rgba(0, 0, 0, 0.7);
  font-family: $fontBangers;
  padding: 0.25rem 1rem !important;
  backdrop-filter: blur(2px);
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
