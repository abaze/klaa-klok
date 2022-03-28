export default {
  namespaced: true,

  // STATE
  state() {
    return {
      audios_url: [
        {
          label: "game",
          url: require("@/assets/sounds/game.mp3"),
        },
        {
          label: "timer",
          url: require("@/assets/sounds/timer.mp3"),
        },
        {
          label: "alarm",
          url: require("@/assets/sounds/timer-finish.mp3"),
        },
        {
          label: "dices",
          url: require("@/assets/sounds/dices.mp3"),
        },
        {
          label: "notif",
          url: require("@/assets/sounds/notif.mp3"),
        },
        {
          label: "popup",
          url: require("@/assets/sounds/popup.mp3"),
        },
        {
          label: "gameOver",
          url: require("@/assets/sounds/game-over.mp3"),
        },
        {
          label: "gameWinner",
          url: require("@/assets/sounds/winner.mp3"),
        },
        {
          label: "openRank",
          url: require("@/assets/sounds/tap.mp3"),
        },
      ],
      audios: [],
    };
  },

  // ACTIONS
  actions: {
    destroyAudios({ state }) {
      const allAudios = state.audios;
      allAudios.forEach((sound, index) => {
        state.audios[index].audio.pause();
      });
      state.audios = [];
    },
    muteAllAudios({ state }, mute) {
      const allAudios = state.audios;
      allAudios.forEach((sound, index) => {
        state.audios[index].audio.muted = mute;
      });
    },
    pauseAudio({ state }, label) {
      const allAudios = state.audios;
      const indexAudio = allAudios.findIndex((audio) => audio.label === label);

      state.audios[indexAudio].audio.pause();
      state.audios[indexAudio].audio.currentTime = 0;
    },
    playAudio({ state }, label) {
      const allAudios = state.audios;
      const indexAudio = allAudios.findIndex((audio) => audio.label === label);

      state.audios[indexAudio].audio.play();
    },
    setVolumeAudio({ state }, { label, volume }) {
      const allAudios = state.audios;
      const indexAudio = allAudios.findIndex((audio) => audio.label === label);
      state.audios[indexAudio].audio.volume = volume;
    },
    setLoopAudio({ state }, { label, loop }) {
      const allAudios = state.audios;
      const indexAudio = allAudios.findIndex((audio) => audio.label === label);
      state.audios[indexAudio].audio.loop = loop;
    },

    initAudios({ state, dispatch }) {
      // init audios
      state.audios = [];

      const allAudios = state.audios_url;
      allAudios.forEach((audio) => {
        const sound = new Audio(audio.url);
        state.audios.push({ label: audio.label, audio: sound });
      });

      /** SET LEVEL VOLUME OF EACH SOUND */
      dispatch("setVolumeAudio", { label: "game", volume: 0.25 });
      dispatch("setVolumeAudio", { label: "timer", volume: 0.5 });
      dispatch("setVolumeAudio", { label: "alarm", volume: 0.5 });
      dispatch("setVolumeAudio", { label: "dices", volume: 0.5 });
      dispatch("setVolumeAudio", { label: "notif", volume: 0.5 });
      dispatch("setVolumeAudio", { label: "popup", volume: 0.5 });
      dispatch("setVolumeAudio", { label: "gameOver", volume: 0.5 });
      dispatch("setVolumeAudio", { label: "gameWinner", volume: 0.5 });
      dispatch("setVolumeAudio", { label: "openRank", volume: 0.8 });

      /** SET LOOPING FOR AUDIOS */
      dispatch("setLoopAudio", { label: "game", loop: true });
      dispatch("setLoopAudio", { label: "timer", loop: true });

      /** PLAY GAME SOUND (musique de fond) */
      dispatch("playAudio", "game");
    },
  },
};
