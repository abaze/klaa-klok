export default {
  namespaced: true,

  // STATE
  state() {
    return {
      player: {
        id: null,
        name: null,
        class: null,
        isReady: false,
        gameOver: false,
        currentMise: 0,
        totalGains: 100,
      },
      playersGains: [],
      creditStart: 100,
    };
  },

  // MUTATIONS
  mutations: {
    // on set la id du player envoyee par le BACK Socket.io
    SET_PLAYER_ID(state, id) {
      state.player.id = id;
    },
    // on set le nom du player
    SET_PLAYER_NAME(state, name) {
      state.player.name = name;
    },
    SET_PLAYER_CLASS(state, name) {
      state.player.class = name;
    },
    SET_PLAYER_IS_READY(state, bool) {
      state.player.isReady = bool;
    },
    SET_PLAYER_IS_GAME_OVER(state, bool) {
      state.player.gameOver = bool;
    },
    // mise courante durant la partie
    SET_CURRENT_MISE(state, mise) {
      state.player.currentMise = mise;
    },
    // gains de la partie terminee (pour le resumé des resultats)
    SET_GAINS_PARTIE(state, gains) {
      state.player.gainsPartie = gains;
    },
    // pertes de la partie terminee (pour le resumé des resultats)
    SET_PERTES_PARTIE(state, lose) {
      state.player.pertesPartie = lose;
    },
    // gains totals toutes parties confondues
    SET_TOTAL_GAINS(state, gains) {
      state.player.totalGains = gains;
    },
    RESET_PLAYERS_GAINS(state) {
      state.playersGains = [];
    },
    ADD_PLAYERS_GAINS(state, data) {
      state.playersGains.push(data);
      state.playersGains.sort((a, b) =>
        b.totalGains > a.totalGains ? 1 : a.totalGains > b.totalGains ? -1 : 0
      );
    },
  },

  // ACTIONS
  actions: {
    setPlayerID({ commit }, data) {
      commit("SET_PLAYER_ID", data);
    },

    setPlayerName({ commit }, data) {
      commit("SET_PLAYER_NAME", data);
    },
    setPlayerClass({ commit }, data) {
      commit("SET_PLAYER_CLASS", data);
    },
    // maj le statut Ready pour Player et Game.PlayersList
    setPlayerIsReady({ commit, state, dispatch }, { value, player }) {
      // si le player current est concerné on maj le STORE
      if (player.id === state.player.id) {
        commit("SET_PLAYER_IS_READY", value);
      } else {
        player.isReady = value;
      }

      // on maj game.playersList
      dispatch(
        "games/majOneFieldPlayersList",
        { id: player.id, field: "isReady", value },
        { root: true }
      );
    },
    resetCurrentMises({ commit }) {
      commit("SET_CURRENT_MISE", 0);
      commit("SET_GAINS_PARTIE", 0);
      commit("SET_PERTES_PARTIE", 0);
    },
    addPlayerGains({ commit }, playerGains) {
      commit("ADD_PLAYERS_GAINS", playerGains);
    },
    /**
     *
     * @param {*} rootState // pour get les var des autres states
     * @param {**} action // 'add' or 'remove'
     * @param {***} mise // {player, mise, face}
     */
    calculMise({ state, commit }, mise) {
      // on gere si le player ajouter ou retire sa mise
      let miseToAjust = parseInt(mise.action == "add" ? mise.mise : -mise.mise);
      let currentMise = state.player.currentMise + miseToAjust;
      // on store la mise courante
      commit("SET_CURRENT_MISE", currentMise);
    },
    // On calcul les gains de NOTRE player
    // les autres vont Broadcaster leur restulat qu'on get par la suite
    calculGains({ state, rootState, commit, dispatch }) {
      // on recupere une copy de notre total de gains
      const player = JSON.parse(JSON.stringify(state.player));
      let username = player.name;
      let id = player.id;
      let currentMise = player.currentMise;
      /*let gainsPartie = player.gainsPartie;
      let pertesPartie = player.pertesPartie;*/
      let totalGains = player.totalGains;

      // toutes les mises de la partie qui vient de se terminer
      const allMises = rootState.mises.misesByPlayer;

      // les 2 faces des dès de la partie qui vient de se terminer
      const chosenFaces = rootState.dices.chosenFaces;

      // on recupère nos mises
      const mises = allMises.filter((mise) => mise.player.id === id) || {};

      // si on a des mises alors
      if (mises.length) {
        // calcul de nos gains
        let moneyWin = 0;
        let moneyLost = 0;

        mises.forEach((mise) => {
          // si notre mise a la mm face que le des 1
          if (mise.face === chosenFaces[0]) {
            moneyWin += mise.mise;
          }
          // si notre mise a la mm face que le des 1
          if (mise.face === chosenFaces[1]) {
            moneyWin += mise.mise;
          }
          // si notre mise n'est pas dans le resultat des des
          if (!chosenFaces.includes(mise.face)) {
            moneyLost += mise.mise;
          }
        });

        // En se basant sur la data copier du STORE (sans reactivité)
        // on calcul le gain total
        let gainsTotal = totalGains;

        // on déduit la mise du gain total
        gainsTotal -= currentMise;

        // calcul du gain au final
        let finalGain = currentMise + (moneyWin - moneyLost);

        // on ajoute les gains au gains total du state
        gainsTotal += finalGain;

        // si gainsTotal est inferieur à 0 on met 0
        gainsTotal = gainsTotal >= 0 ? gainsTotal : 0;

        // on maj notre STORE
        commit("SET_GAINS_PARTIE", moneyWin);
        commit("SET_PERTES_PARTIE", moneyLost);
        commit("SET_TOTAL_GAINS", gainsTotal);

        // si notre player n'a plus d'argent on le met en gameOver
        if (gainsTotal === 0) {
          commit("SET_PLAYER_IS_GAME_OVER", true);
        }

        // On push dans playersGains du STORE
        const playerGains = {
          player: {
            username,
            id,
          },
          mise: currentMise,
          gains: moneyWin,
          pertes: moneyLost,
          totalGains: gainsTotal,
        };
        // cest le classement qu'affichera la popup
        commit("ADD_PLAYERS_GAINS", playerGains);
      }
      // on affiche la popup des restultas
      const dataToOverlay = {
        action: "results",
        data: true,
      };
      dispatch("overlay/openOverlay", dataToOverlay, { root: true });
    },
    resetPlayersGains({ commit }) {
      // on reset le tab des playersGains
      commit("RESET_PLAYERS_GAINS");
    },
  },
};
