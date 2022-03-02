export default {
  namespaced: true,
  state() {
    return {
      data: null,
    };
  },
  mutations: {
    SET_DATA(state, data) {
      state.data = data;
    },
  },
  actions: {
    openOverlay({ commit }, data) {
      commit("SET_DATA", data);
    },
  },
};
