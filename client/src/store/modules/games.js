export default {
  namespaced: true,

  // STATE
  state() {
    return {
      game: {
        roomId: null,
        limitPlayers: null,
        gameNumber: 0,
        gameOver: false,
        isWinner: false,
        allPlayersAreHere: false,
        gameIsReady: false,
        mainPlayer: {},
        playersList: [],
      },
    };
  },

  mutations: {
    INIT_GAME_DATA(state, data) {
      state.game = data;
    },
    SET_GAME_NUMBER(state, num) {
      state.game.gameNumber = num;
    },
    SET_ROOM_ID(state, num) {
      state.game.roomId = num;
    },
    SET_LIMIT_PLAYERS(state, limit) {
      state.game.limitPlayers = limit;
    },
    SET_GAME_OVER(state, bool) {
      state.game.gameOver = bool;
    },
    SET_IS_WINNER(state, bool) {
      state.game.isWinner = bool;
    },
    SET_ALL_PLAYERS_ARE_HERE(state, bool) {
      state.game.allPlayersAreHere = bool;
    },
    SET_GAME_IS_READY(state, bool) {
      state.game.gameIsReady = bool;
    },
    SET_MAIN_PLAYER(state, player) {
      state.game.mainPlayer = player;
    },
    ADD_PLAYER_TO_LIST(state, player) {
      state.game.playersList.push(player);
    },
    REMOVE_PLAYER_FROM_LIST(state, indexToRemove) {
      state.game.playersList.splice(indexToRemove, 1);
    },
    MAJ_PLAYERS_LIST(state, list) {
      state.game.playersList = list;
    },
    MAJ_ONE_PLAYER_IN_LIST(state, { index, player }) {
      state.game.playersList[index] = player;
    },
    MAJ_ONE_FIELD_PLAYER_IN_LIST(state, { index, field, value }) {
      state.game.playersList[index][field] = value;
    },
  },

  actions: {
    initGame({ commit }, data) {
      commit("INIT_GAME_DATA", data);
    },
    createGame({ commit }, options) {
      const { roomId, limitPlayers } = options;

      commit("SET_ROOM_ID", roomId);
      commit("SET_LIMIT_PLAYERS", limitPlayers);
    },
    setRoomID({ commit }, id) {
      commit("SET_ROOM_ID", id);
    },
    addPlayer({ commit }, player) {
      commit("ADD_PLAYER_TO_LIST", player);
    },
    removePlayer({ commit, state, dispatch }, playerToRemove) {
      const listePlayers = state.game.playersList;
      console.table("playersList avant remove : ", listePlayers);
      listePlayers.forEach((player, index) => {
        if (player.id === playerToRemove.id) {
          commit("REMOVE_PLAYER_FROM_LIST", index);
        }
      });

      console.table("playersList apres remove : ", listePlayers);

      // on lance une notif
      const notif = {
        msg: `${playerToRemove.name} vient de se déconnecter`,
        label: "bad",
      };
      dispatch("notifications/addNotification", notif, { root: true });
    },
    majPlayerList({ commit }, newList) {
      commit("MAJ_PLAYERS_LIST", newList);
    },
    majOnePlayerList({ commit, state }, playerMaj) {
      const allPlayers = state.game.playersList;
      allPlayers.forEach((player, index) => {
        if (player.id === playerMaj.id) {
          commit("MAJ_ONE_PLAYER_IN_LIST", { index, player: playerMaj });
        }
      });
    },
    majOneFieldPlayersList({ commit, state }, { id, field, value }) {
      const allPlayers = state.game.playersList;
      allPlayers.forEach((player, index) => {
        if (player.id === id) {
          commit("MAJ_ONE_FIELD_PLAYER_IN_LIST", { index, field, value });
        }
      });
    },
    initOptions({ commit, state, rootState, dispatch }, options) {
      // permet de MAJ les champs concernant la game en cours
      commit("SET_ALL_PLAYERS_ARE_HERE", options.allPlayersAreHere);
      commit("SET_GAME_IS_READY", options.gameIsReady);
      commit("SET_GAME_NUMBER", options.gameNumber);
      commit("SET_GAME_OVER", options.gameOver);
      commit("SET_IS_WINNER", options.isWinner);
      commit("SET_LIMIT_PLAYERS", options.limitPlayers);

      // on reinit tous les fields dans playersList
      state.game.playersList.forEach((player) => {
        dispatch("majOneFieldPlayersList", {
          id: player.id,
          field: "gameOver",
          value: false,
        });
        dispatch("majOneFieldPlayersList", {
          id: player.id,
          field: "totalGains",
          value: rootState.players.creditStart,
        });
      });
    },
    setMainPlayer({ commit }, player) {
      commit("SET_MAIN_PLAYER", player);
    },
    readyToPlay({ commit }, value) {
      commit("SET_GAME_IS_READY", value);
    },
    allPlayersAreHere({ commit }, value) {
      commit("SET_ALL_PLAYERS_ARE_HERE", value);
    },
    // avant de jouer on prepare toutes les variables
    prepareNextGame({ dispatch, rootState }) {
      // si notre player est GameOver, son statut Ready sera toujours True (pour pas bloquer les autres)
      // sinon on met notre player à not Ready dans Player et dans PlayersList
      let ready = false;

      // si joueur gameover on force ready à true
      if (rootState.players.player.gameOver) {
        ready = true;
      }

      dispatch(
        "players/setPlayerIsReady",
        { value: ready, player: rootState.players.player },
        { root: true }
      );

      // on dit que la game nest pas prete
      dispatch("readyToPlay", false);
      // on reset le resultat des dés
      dispatch("dices/resetChosenFaces", {}, { root: true });
      // on clear toutes les mises des joueurs
      dispatch("mises/resetAllMises", {}, { root: true });
      // on clear mes datas mises egalement
      dispatch("players/resetCurrentMises", {}, { root: true });
      // on clear tous les gains dans playersGains
      dispatch("players/resetPlayersGains", {}, { root: true });
    },
    // on init et on lance une new partie
    startGame({ commit, state, dispatch }) {
      // on init le numero de la partie
      let currentNumber = state.game.gameNumber;
      commit("SET_GAME_NUMBER", currentNumber + 1);
      // on dit que la game est ready
      dispatch("readyToPlay", true);
    },
    // GameOver pour le current Player
    gameOver({ commit }) {
      commit("SET_GAME_OVER", true);
    },
    // GameOver pour le current Player
    isWinner({ commit }) {
      commit("SET_IS_WINNER", true);
    },
  },
  getters: {
    isAWinner(state) {
      if (state.game.playersList && state.game.allPlayersAreHere) {
        const playersAlive = [];
        state.game.playersList.forEach((player) => {
          if (player.totalGains > 0) {
            playersAlive.push({
              name: player.name,
              gains: player.totalGains,
            });
          }
        });

        if (playersAlive.length === 1) {
          state.game.isWinner = true;
        } else {
          state.game.isWinner = false;
        }
        return playersAlive.length === 1 ? playersAlive : [];
      } else {
        return [];
      }
    },
    isGameOver(state) {
      if (state.game.playersList) {
        const playersOver = [];
        state.game.playersList.forEach((player) => {
          if (player.totalGains === 0) {
            playersOver.push(player.name);
          }
        });
        return playersOver.length === state.game.limitPlayers ? true : false;
      } else {
        return false;
      }
    },
  },
};
