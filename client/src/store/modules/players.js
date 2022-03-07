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
    // On calcul les gains des joueurs en fonction de leurs mises
    calculGains({ state, commit, rootState, dispatch }) {
      // les 2 faces des dès de la partie qui vient de se terminer
      const chosenFaces = rootState.dices.chosenFaces;
      // on get toutes les mises
      const all_mises = rootState.mises.misesByPlayer;
      // on get tous les players de la game (on fait une copy non reactive)
      const players = JSON.parse(
        JSON.stringify(rootState.games.game.playersList)
      );
      // on loop chaque player pour attribution des gains
      players.forEach((player, indexPlayer) => {
        // on get les mises par joueur à chaque loop
        const misesOfPlayer = all_mises.filter(
          (mise) => mise.player.id === player.id
        );
        // on get largent total misé par le player
        const monneyBet = all_mises
          .filter((mise) => mise.player.id === player.id)
          .map((mise) => mise.mise)
          .reduce((tmise, mise) => tmise + mise, 0);
        let moneyWin = 0,
          moneyLost = 0;
        // on loop sur chaque mise du player
        misesOfPlayer.forEach((mise) => {
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

        // on get le total de gains actuel du state (game.playersList.totalGains)
        let currentTotalGains = JSON.parse(
          JSON.stringify(
            rootState.games.game.playersList[indexPlayer].totalGains
          )
        );
        // on calcul le solde restant :  total - la mise
        currentTotalGains -= monneyBet;
        // calcul des gains générés
        const totalGains = monneyBet + (moneyWin - moneyLost);
        // on reattribue tout au total
        currentTotalGains += totalGains;

        // si au final on a tout perdu (ou total < 0), on init totalGains à 0
        // si notre player n'a plus d'argent on le met en gameOver
        if (currentTotalGains <= 0) {
          currentTotalGains = 0;
          // on set le GameOver pour le joueur dans game.playersList
          dispatch(
            "games/majOneFieldPlayersList",
            { id: player.id, field: "gameOver", value: true },
            { root: true }
          );

          // si on loop sur notre profil, on maj le store egalement
          if (player.id === state.player.id) {
            commit("SET_PLAYER_IS_GAME_OVER", true);
          }
        }

        // On push dans playersGains du STORE
        const playerGains = {
          player: {
            name: player.name,
            id: player.id,
          },
          mise: monneyBet,
          detailMises: misesOfPlayer,
          gains: moneyWin,
          pertes: moneyLost,
          totalGains: currentTotalGains,
        };
        // cest le classement qu'affichera la popup
        commit("ADD_PLAYERS_GAINS", playerGains);

        // on met à jour les infos du joueur dans game.playersList
        dispatch(
          "games/majOneFieldPlayersList",
          { id: player.id, field: "totalGains", value: currentTotalGains },
          { root: true }
        );
        // on remet le statut ready à false pour chaque player
        dispatch("setPlayerIsReady", { value: false, player });

        // si on loop sur notre profil, on maj le store
        if (player.id === state.player.id) {
          commit("SET_TOTAL_GAINS", currentTotalGains);
        }
      });

      // on affiche la popup des resultats
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
