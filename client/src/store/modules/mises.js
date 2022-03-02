export default {
  namespaced: true,

  // STATE
  state() {
    return {
      /**
       * {  partie : 1,
       * [
       *    { player : 'player-1', face : 'tiger', mise: 200},
       *    { player : 'player-2', face : 'shrimp', mise: 40}
       * ]}
       */
      misesHistoric: [],
      /**
       *
       *    { player : 'player-1', face : 'tiger', mise: 200},
       *    { player : 'player-1', face : 'crab', mise: 50},
       *    { player : 'player-3', face : 'chicken', mise: 450}
       *
       */
      misesByPlayer: [],
      faces: [
        {
          id: "tiger",
          label: "Tigre",
          diceFace: "front",
          angleCss: "0, 0, 0, 0deg",
        },
        {
          id: "crab",
          label: "Crabe",
          diceFace: "left",
          angleCss: "0, 1, 0, 90deg",
        },
        {
          id: "pumpkin",
          label: "Citrouille",
          diceFace: "back",
          angleCss: "0, 1, 0, 180deg",
        },
        {
          id: "fish",
          label: "Poisson",
          diceFace: "right",
          angleCss: "0, 1, 0, 270deg",
        },
        {
          id: "shrimp",
          label: "Crevette",
          diceFace: "bottom",
          angleCss: "1, 0, 0, 90deg",
        },
        {
          id: "chicken",
          label: "Coq",
          diceFace: "top",
          angleCss: "1, 0, 0, 270deg",
        },
      ],
    };
  },
  // MUTATIONS
  mutations: {
    ADD_MISES_HISTORIC(state, mises) {
      state.misesHistoric.push(mises);
    },
    ADD_MISES_BY_PLAYER(state, mise) {
      state.misesByPlayer.push(mise);
    },
    UPDATE_MISES_BY_PLAYER(state, mises) {
      state.misesByPlayer = mises;
    },
  },

  // ACTIONS
  actions: {
    /**
     *
     * @param {*} {commit}
     * @param {**} mise // array contenant {player, face, mise}
     */
    savePlayerMise({ commit }, data_mise) {
      // on ajoute la mise du joueur dans le tableaux misesByPlayer
      commit("ADD_MISES_BY_PLAYER", data_mise);
    },

    deletePlayerMise({ state, commit }, miseToRemove) {
      const mises = state.misesByPlayer;

      // on recherche l'element ayant le mm player et la mm face et on delete
      mises.forEach((mise, i) => {
        if (
          mise.face === miseToRemove.face &&
          mise.player.id === miseToRemove.player.id
        ) {
          mises.splice(i, 1);
        }
      });

      commit("UPDATE_MISES_BY_PLAYER", mises);
    },
    resetAllMises({ commit }) {
      commit("UPDATE_MISES_BY_PLAYER", []);
    },

    /**
     *
     * @param {*} {state, commit}
     * @param {*} {partie, mises}
     */
    saveHistoricMise({ commit, rootState }, { mises }) {
      // une fois le chrono terminé, on add le num de la partie + toutes les mises à l'historic
      commit("ADD_MISES_HISTORIC", {
        partie: rootState.games.game.gameNumber,
        mises,
      });
    },
  },
};
