export default {
  namespaced: true,

  // STATE
  state() {
    return {
      chronoIsFinish: false,
      initialChronoLimit: 30,
      chrono: "00:00",
      countSeconds: null,
    };
  },
  // MUTATIONS
  mutations: {
    SET_COUNT_SECONDS(state, value) {
      state.countSeconds = value;
    },
    SET_CHRONO(state, value) {
      state.chrono = "00:" + String(value).padStart(2, "0");
    },
    SET_CHRONO_IS_FINISH(state, value) {
      state.chronoIsFinish = value;
    },
  },

  // ACTIONS
  actions: {
    startChrono({ state, commit, dispatch }) {
      // init du chrono
      commit("SET_CHRONO_IS_FINISH", false);
      commit("SET_COUNT_SECONDS", state.initialChronoLimit);
      commit("SET_CHRONO", state.countSeconds);

      // on remet les des à 0
      commit("dices/INIT_CHOSEN_FACES", [], { root: true });
      // on remet les mises du joueur à 0
      commit("mises/UPDATE_MISES_BY_PLAYER", [], { root: true });

      // on fait partir un interval jusqu'arriver à 0
      const intervalEverySecond = setInterval(() => {
        if (state.countSeconds > 1) {
          commit("SET_COUNT_SECONDS", state.countSeconds - 1);
          commit("SET_CHRONO", state.countSeconds);
        } //si chrono arrive à 0, on update chronoIsFinish
        else {
          clearInterval(intervalEverySecond);
          commit("SET_COUNT_SECONDS", null);
          commit("SET_CHRONO", 0);
          commit("SET_CHRONO_IS_FINISH", true);

          // on ferme la popup des miseurs au cas ou
          dispatch("overlay/openOverlay", null, { root: true });
        }
      }, 1000);
    },
  },
};
