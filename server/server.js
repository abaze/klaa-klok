const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");

const PORT = process.env.PORT || 3000;
const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(router);

// array qui va stocker les rooms et les players qui y participent
// on se calque sur les var du store/game en Front
let roomsIdAvailable = [];
/**
Schema d'une room :    
{
    roomId: null,
    limitPlayers: 2,
    gameNumber: 0,
    gameOver: false,
    isWinner: false,
    gameIsReady: false,
    playersList: [],
}
 **/
let rooms = [];

io.on("connection", function (socket) {
  // des l'arrivée du player sur le site
  // on transmet l'id de session au front
  socket.emit("new_connection", socket.id);

  /**
   * SCENARIO : CREATE NEW GAME
   */

  // ETAPE 1a - FRONT nous demande de stocker une new game (new room)
  socket.on("create_new_game", (room) => {
    console.log(
      `Le player vient de cree une new game, on push la room ${room.roomId}`
    );
    // on push la new rom
    rooms.push(room);
    // on stock l'id room (pour pouvoir verifier rapidement les rooms dispo)
    roomsIdAvailable.push(room.roomId);
    // on push le player dans la room socket
    socket.join(room.roomId);
  });

  // ETAPE 1b - FRONT nous demande si code salon existe
  socket.on("verife_code_salon", (code) => {
    const isExist = roomsIdAvailable.includes(code);
    socket.emit("is_code_salon_exist", { id: code, data: isExist });
    if (isExist) {
      socket.join(code);
    }
  });

  // ETAPE 2 - FRONT nous signale qu'il vient d'arriver dans la room de jeu
  socket.on("player_request_init_room_data", (roomId, callback) => {
    // on recupere la data du tableau rooms
    const room = rooms.filter((room) => room.roomId === roomId)[0] || false;

    // on EMIT tout au Front
    socket.emit("receive_init_room_data", { id: room.roomId, data: room });
    callback({
      id: room.roomId || null,
      data: room || null,
    });
    console.log("on envoie la room suivant : ", room.roomId || null);
  });

  // ETAPE 3 - FRONT le player se rajoute à la liste des players de la room
  socket.on("send_my_player", ({ id, data }, callback) => {
    console.log("Un joueur veut être stocker dans le BACK");
    // on va stocker ce joueur dans notre tableau rooms
    rooms.forEach((room) => {
      // une fois la room trouvée, on push notre player dans la playersList
      if (room.roomId === id) {
        room.playersList.push(data);
        callback({
          msg: `Bienvenue à vous ${data.name} !`,
        });
        // on BROADCAST aux joueurs de la room déjà connectés qu'un new player est à ajouter
        socket.broadcast
          .to(room.roomId)
          .emit("new_player_is_coming", { id, data });
        console.log("Liste participants : ", room.playersList);
      }
    });
  });

  /**
   * SCENARIO PLATEAU DE JEU
   */

  // ETAPE 1 - FRONT : un joueur nous signal un changement de son statut (ready or not, laureen hill sisi)
  // on broadcast l'info aux autres (on send toute la data player)
  socket.on("my_player_update_ready", ({ id, data }) => {
    const playerReady = data;
    const roomId = id;

    //console.log(`${playerReady.name} de la room ${roomId} a son ready à ${playerReady.isReady} !`);

    // on isole la bonne room
    rooms.forEach((room) => {
      if (room.roomId === roomId) {
        // on isole le bon player pour lui maj ses datas
        room.playersList.forEach((player, indexPlayer) => {
          if (player.id === playerReady.id) {
            room.playersList[indexPlayer] = playerReady;

            // on broadcast les data du player
            socket.broadcast
              .to(roomId)
              .emit("one_player_update_ready", { id, data: playerReady });
          }
        });
      }
    });
  });

  // ETAPE 2 - GESTION DES MISES
  // Quand un player vient de miser, on broadcast aux autres players
  socket.on("player_mised", ({ id, data }) => {
    socket.broadcast.to(id).emit("send_mise_adverse", { id, data });
  });
  // Quand un player vient de remove une de ses mises, on broadcast aux autres players
  socket.on("player_removed_mise", ({ id, data }) => {
    socket.broadcast.to(id).emit("send_remove_mise_adverse", { id, data });
  });

  // ETAPE 3 - GESTION DU LANCER DE DES

  //le mainPlayer vient de lancer les dés
  // le mainPlayer nous envoie les randomFace de chacun de ses dés + la key du dés concerné
  socket.on("you_can_throw_dices", ({ id, data }) => {
    console.log(
      `BACK : le mainPlayer nous envoie ces random : ${data.face1} et ${data.face2}`
    );
    // on les send direct aux autres player pour qu'ils aient le mm resultat
    socket.broadcast.to(id).emit("send_dices_faces", {
      id,
      data: {
        face1: data.face1,
        face2: data.face2,
      },
    });
    console.log(
      `BACK : on broadcast aux autres ces random : ${data.face1} et ${data.face2}`
    );
  });

  // ETAPE 4 - MAJ DES GAINS EN LIVE
  // le Front nous envoie ses gains
  socket.on("send_my_gains", ({ id, data }) => {
    console.log(
      `${data.player.username} vient de nous envoyer son gain : `,
      data
    );
    // on le broadcast aux autres
    socket.broadcast.to(id).emit("receive_oponent_gains", { id, data });
    console.log(`On broadcast ces gains : `, data);
  });

  // ETAPE - DECONNEXION
  socket.on("disconnect", () => {
    rooms.forEach((room, indexRoom) => {
      room.playersList.forEach((player, indexPlayer) => {
        if (player.id === socket.id) {
          console.log("liste avant : ", rooms[indexRoom].playersList);
          console.log(`${player.name} vient de partir !`);
          // on broadcast aux autres players l'id du player à supprimer de leur liste
          socket.broadcast.to(room.roomId).emit("player_leave", {
            id: rooms[indexRoom].roomId,
            data: player,
          });

          // on supprime egalement le player cote BACK
          rooms[indexRoom].playersList.splice(indexPlayer, 1);
          console.log("liste apres : ", rooms[indexRoom].playersList);
          // si après delete il n'y a plus aucun joueur, on kill la room via le code room
          if (!rooms[indexRoom].playersList) {
            const idRoom = rooms[indexRoom].roomId;
            console.log(`Bon bah y a plus de joueur dans la room ${idRoom}`);
            rooms.splice(indexRoom, 1);
            // on delete l'id room du tableau des id rooms dispo
            roomsIdAvailable.splice(roomsIdAvailable.indexOf(idRoom), 1);
          }
        }
      });
    });
    /*console.log(rooms[0].playersList[0].id);
    console.log(socket.id);*/
  });

  // Notify all users that you'r typing
  //   socket.on("typing", function (data) {
  //     socket.broadcast.emit("typing", data);
  //   });
});

server.listen(PORT, () => console.log(`Server has started on PORT ${PORT}`));
