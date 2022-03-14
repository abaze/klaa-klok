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
          // on lance le timer
          this.pauseAudio("alarm");
          this.playAudio("timer");
        }
      },
    },
    "chrono.chronoIsFinish": function (isFinish) {
      if (isFinish) {
        // on lance le timer
        this.pauseAudio("timer");
        this.playAudio("alarm");
      }
    },
  },
  methods: {
    ...mapActions({
      startChrono: "chrono/startChrono",
      playAudio: "audios/playAudio",
      pauseAudio: "audios/pauseAudio",
    }),
  },
};
</script>

<style lang="scss">
.chrono {
  border-radius: 15px;
  box-shadow: 0 5px 5px 0px rgba(0, 0, 0, 0.8);
  background-image: url(../assets/board/bg.jpg);
  background-size: cover;
  background-repeat: no-repeat;
  font-family: $fontBangers;
  padding: 0.25rem 1rem !important;

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
