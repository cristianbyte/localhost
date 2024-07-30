import { initializeGameView } from './scenes/starting.js';

let root = document.getElementById('root');
let home = document.createElement('div');
let header = document.createElement('header');
let playButton = document.createElement('button');
let gameView = document.createElement('canvas');

home.className = 'home';
header.className = 'header';
header.textContent = 'Garraventura';
playButton.className = 'play';
gameView.className = 'gameView';
gameView.id = 'gameView';

home.appendChild(header);
home.appendChild(playButton);
root.appendChild(home);

// playButton.addEventListener('click', ()=>{
    root.removeChild(home);
    root.appendChild(gameView);

    initializeGameView();
// })

