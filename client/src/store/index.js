import { createStore } from "vuex";

import GamesModule from "./modules/games.js";
import ChronoModule from "./modules/chrono.js";
import PlayersModule from "./modules/players.js";
import MisesModule from "./modules/mises.js";
import DicesModule from "./modules/dices.js";
import OverlayModule from "./modules/overlay.js";
import NotificationsModule from "./modules/notifications.js";
import AudiosModule from "./modules/audios.js";

const store = createStore({
  modules: {
    games: GamesModule,
    chrono: ChronoModule,
    players: PlayersModule,
    mises: MisesModule,
    dices: DicesModule,
    overlay: OverlayModule,
    notifications: NotificationsModule,
    audios: AudiosModule,
  },
});

export default store;
