export default {
  namespaced: true,

  state() {
    return {
      throwIsDone: false,
      chosenFaces: [],
    };
  },

  mutations: {
    SET_THROW_IS_DONE(state, value) {
      state.throwIsDone = value;
    },
    ADD_CHOSEN_FACES(state, value) {
      state.chosenFaces.push(value);
    },
    INIT_CHOSEN_FACES(state, value) {
      state.chosenFaces = value;
    },
  },

  actions: {
    // function qui va push le resultat de chaque dés
    getChosenFace({ commit, rootState }, face) {
      // on se refere au tables des faces pour recup l'id de la face qu'on veut
      const faces = rootState.mises.faces;
      commit("ADD_CHOSEN_FACES", faces[face.face1].id);
      commit("ADD_CHOSEN_FACES", faces[face.face2].id);
      commit("SET_THROW_IS_DONE", true);
    },
    // reinit chosenFaces
    resetChosenFaces({ commit }) {
      commit("INIT_CHOSEN_FACES", []);
      commit("SET_THROW_IS_DONE", false);
    },
    // function qui va mettre à jour ThrowIsDone
    setThrowState({ commit }, value) {
      commit("SET_THROW_IS_DONE", value);
    },
  },
};
