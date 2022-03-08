<template>
  <div class="box chrono">
    <!-- SI LA PARTIE EST PRETE -->
    <template v-if="game.allPlayersAreHere && game.gameIsReady">
      <h1>Partie {{ game.gameNumber }}</h1>
      <template v-if="!chrono.chronoIsFinish">
        <div class="zone-time">
          <div class="zone-picto">
            <i class="fa fa-clock-o logo-timer" aria-hidden="true"></i>
            <span class="text-timer">Temps restant</span>
          </div>

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
    <bg-waves :color="'#1a3131'" :animate="true" />
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

import bgWaves from "./bg-waves.vue";
export default {
  name: "chrono",
  components: { bgWaves },
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

  background: #1a3131;

  .zone-time {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    font-size: clamp(2rem, 2vw, 3.5rem);
    color: var(--orange);
    width: 150px;
    height: 150px;
    border-radius: 50%;
    border: 1px solid var(--orange);

    .zone-picto {
      font-size: 0.9rem;

      .logo-timer {
        margin-right: 0.3rem;
      }
    }

    .time {
      margin-left: 0.2rem;
      animation: blink 1s linear infinite alternate;

      @keyframes blink {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    }
  }
}
</style>
