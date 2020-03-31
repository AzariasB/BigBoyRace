# BigBoyRace

![Titre](images/title.png)

Un jeu créé par :
- ABET Jean-Baptiste
- BOUTIN Azarias
- KAINDOH Tommy
- MOCKELS Maxime
- RAFFI Guillaume
- SEGRAIS Lucas

Contexte
-------------------------------

- [x] Accessible à tous
- [x] Jouable sur n'importe quelle machine
- [x] Jeu multijoueur
- [x] Interactions entre les joueurs

=> Jeu de course sur navigateur

Jeu multijoueur sur navigateur
-------------------------------

Avantages:
- Léger
- Accessible par tout le monde
- Léger pour le serveur

Inconvénients:
- Manque de puissance

Caractéristiques du jeu:
-------------------------------
- Espace de jeu en 2D
- Personnage au centre de l'écran
- Plusieurs chemins
- Possibilité de poser des pièges
- Pièges persistans sur la course suivante
- Possibilité de créer ou de rejoindre des parties

Pourquoi BigBoyRace ?
-------------------------------
- Jeu dynamique
- Partie courte
- Technologie récente
- Multijoueur
- Intérêt compétitif


Cible
------
- Public jeune
- Etudiant
- Peu de temps libre
- Habitués du jeux vidéo

Rôles
------

| Jean\-Baptiste    | Azarias           | Tommy                  | Maxime         | Guillaume         | Lucas             |
|-------------------|-------------------|------------------------|----------------|-------------------|-------------------|
| Game Designer     | Game Designer     | Game Designer          | Game Designer  | Game Designer     | Game Designer     |
| Développeur front | Développeur front | Administrateur système | Level designer | Développeur front | Développeur front |
|                   | Développeur back  |                        |                | Développeur back  | Level designer    |


Prototype :
---------------------
<img src="images/prototype.gif" width="500" alt="scoreboard" />

## Résultats

<img src="images/menu.png" width="500" alt="menu" />
<img src="images/tutorial.png" width="500" alt="tutorial" />
<img src="images/credits.png" width="500" alt="credits" />
<img src="images/create.png" width="500" alt="create" />
<img src="images/join.png" width="500" alt="join" />

En jeu
-------
<img src="images/ingame1.png" width="500" alt="ingame1" /><br/>
<img src="images/move.gif" width="500" alt="move" />
<img src="images/moveB.gif" width="100" alt="moveZoom" /><br/>
<img src="images/jump.gif" width="500" alt="jump" />
<img src="images/jumpB.gif" width="100" alt="jumpZoom" /><br/>
<img src="images/crouch.gif" width="500" alt="crouch" />
<img src="images/crouchB.gif" width="100" alt="crouchZoom" /><br/>
<img src="images/walljump.gif" width="500" alt="walljump" /><br/>
<img src="images/slide.gif" width="500" alt="slide" />
<img src="images/slideB.gif" width="100" alt="slideZoom" /><br/>
<img src="images/roll.gif" width="500" alt="roll" />
<img src="images/rollB.gif" width="100" alt="rollZoom" /><br/>
<img src="images/wallslide.gif" width="500" alt="wallslide" />
<img src="images/wallslideB.gif" width="100" alt="wallslideZoom" /><br/>
<img src="images/chat.png" width="500" alt="chat" />
<img src="images/scoreboard.png" width="500" alt="scoreboard" />


Moyens mis en place :
---------------------
- Langage : Typescript
- Framework front-end: Phaser
- Back-end: Node/Express
- Création de la carte : Tiled
- Compilation : Webpack
- VSC : Git/Github

Simplification machine à états :
--------------------------------
<img src="images/statemachine.png" width="500" alt="scoreboard" />

Edition de la carte :
---------------------
<img src="images/tilededition.png" width="500" alt="scoreboard" />