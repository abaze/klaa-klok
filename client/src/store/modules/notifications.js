import { v4 as uuid } from "@lukeed/uuid";

export default {
  namespaced: true,
  state() {
    return {
      notifications: [],
    };
  },

  mutations: {
    ADD_NOTIFICATION(state, notif) {
      state.notifications.push(notif);
    },
    UPDATE_NOTIFICATIONS(state, notifs) {
      state.notifications = notifs;
    },
  },

  actions: {
    addNotification({ commit }, data) {
      const notif = {
        id: uuid(),
        msg: data.msg,
        label: data.label,
      };

      commit("ADD_NOTIFICATION", notif);
    },
    removeNotification({ commit, state }, id) {
      const notifications = state.notifications.filter(
        (notif) => notif.id !== id
      );
      commit("UPDATE_NOTIFICATIONS", notifications);
    },
  },
};
