<template>
  <div v-if="notifications.length" class="notifs">
    <div
      v-for="(notification, index) in notifications"
      class="msg"
      :key="notification.id"
      :class="['msg-' + (index + 1), notification.label, notification.id]"
    >
      {{ notification.msg }}
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  name: "notification",
  data() {
    return {
      list_notifications: [],
      audioNotif: new Audio(require("@/assets/sounds/notif.mp3")),
    };
  },
  computed: {
    ...mapState({
      notifications: (state) => state.notifications.notifications,
    }),
  },
  watch: {
    notifications: {
      deep: true,
      handler(notifs) {
        if (notifs.length > 0) {
          this.list_notifications = notifs;
          this.audioNotif.volume = 0.5;
          this.audioNotif.play();
          notifs.forEach((notif, i) => {
            this.closeNotif(notif.id, i + 1);
          });
        }
      },
    },
  },
  methods: {
    ...mapActions({
      removeNotification: "notifications/removeNotification",
    }),
    async closeNotif(id, index) {
      // on attend que le DOM soit pret
      await this.$nextTick();
      // on recupere la div de la notif a supprimer
      const notif = document.querySelector(".notifs .msg-" + index) || false;

      if (notif) {
        // on lance lanime pour faire disparaitre la div
        notif.classList.add("close");
        setTimeout(() => {
          // on remove du DOME et du STORE
          notif.remove();
          this.removeNotification(id);
        }, 4000);
      }
    },
  },
};
</script>

<style lang="scss">
.notifs {
  position: fixed;
  bottom: 10px;
  right: 10px;

  .msg {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--purple);
    font-size: 1.2rem;
    font-weight: 300;
    border-radius: 15px;
    padding: 1rem;
    margin: 0.5rem auto;
    border: 3px solid;
    background-color: #fff;
    box-shadow: inset 0 0 0 3px rgba(255, 255, 255, 0.2);
    &.close {
      animation: closeNotif 1s linear 2s forwards;

      @keyframes closeNotif {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }
    }
    &.good {
      border-color: var(--green);
      color: var(--green);
    }
    &.bad {
      border-color: var(--red);
      color: var(--red);
    }
  }
}
</style>
