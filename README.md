# Projet klaa-klok Game

![Klaa Klok Game](/client/public/img/screen/faces.jpg "Le jeu du Klaa Klok")

## Description

<p>
    Jeu de dés d'origine asiatique, "Klaa" (Tigre) "Klok" (Courge) est un jeu populaire dans l'Asie du Sud, pratiqué par les enfants mais également par les adultes.    
</p>
<p>
On y joue à l'aide de 2 dés sur lesquels sont représentés : 
</p>
<ul>
<li>un Tigre</li>
<li>un Crabe</li>
<li>une Courge (ici une Citrouille)</li>
<li>un Poisson</li>
<li>une Crevette</li>
<li>un Coq</li>
</ul>
<p>Les joueurs misent de l'argent sur les 6 faces du plateau, leur gain est déterminé par les faces retournées par les dés. Si l'une des faces correspond à l'image choisie, le joueur remporte le montant misé sur celle-ci. Si les 2 faces correspondent au mises du joueur, il remporte les 2 mises correspondantes. Toutes les mises n'ayant aucune correspondance avec les dés, sont perdues
</p>

![Formulaire de mise](/client/public/img/screen/mise.jpg "Formulaire de mise")

<p>
Le dernier joueur a avoir de l'argent dans sa cagnotte sera considéré comme le grand gagnant de la partie.<br>
Deux modes de jeu sont disponibles , le <strong>mode Solo</strong> (1 player vs l'IA) et un <strong>mode Multijoueur</strong> qui peut se jouer jusqu'à 6 joueurs simultanément
</p>

![Modes de jeu](/client/public/img/screen/modes.jpg "Modes de jeu")

<br>

# Stack technique

## Backend

Le Back est composé d'un serveur <strong>Express</strong> et de la libraire <strong>SocketIO</strong> (permettant la gestion multijoueur en écoutant les évenements des joueurs connectés)

Le Back n'est sollicité que pour le mode **Multijoueur**, il s'occupe de broadcaster les données des joueurs d'un salon afin de permettre la mise à jour en temps réel de l'avancée de la partie (scores, lancement des dés...)

## Frontend

Le Front repose sur le framework **VueJS** et la libraire **SocketIO** pour faire le pont avec le Back.

Les données, des joueurs et de la partie, sont gérées par le **Store** et sont ensuite redistribuées via **SocketIO** qui se gère de la propagation à tout le salon.

## Progressive Web App

Pour un meilleur confort de jeu, ce dernier est disponible sous forme de PWA.
Il suffit juste d'installer l'application sur votre écran d'accueil sur mobile ou tablette.
<br>
<br>

# Mise en route du projet

Une fois le projet cloné, vous devez démarrer les services Back et Front

## Lancement Back

Dans une première console, placez vous dans le repertoire **"/server"** et tapez la cmd suivante :

```
npm run start
```

## Lancement Front

Dans une seconde console, placez vous dans le repertoire **"/client"** et tapez la cmd suivante :

```
npm run serve
```

<br>

<h2 align="center">
Vous pouvez tester la <a href="https://klaa-klok.netlify.app/" target="_blank">démo en ligne</a>
</h2>
