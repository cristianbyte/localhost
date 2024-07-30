//view



export function initializeGameView() {

    const sprites = {
        "quiet": {
            x: 45,
            y: 50,
            w: 30,
            h: 40
        },
        "running": {
            x: 85,
            y: 50,
            w: 30,
            h: 40
        }
    };
    
    let gameView = document.getElementById('gameView');
    let windowHeight = window.innerHeight;
    let windowWidth = windowHeight / 2;
    let context;

    // main character
    let mainCharacter = {
        x: windowWidth / 6,
        y: windowHeight / 2,
        width: 34,
        height: 24,
        speed: 5,
        image: new Image()
    };
    //source from html
    mainCharacter.image.src = './assets/images/deadpool.png';


    gameView.height = windowHeight;
    gameView.width = windowWidth;
    context = gameView.getContext('2d');
    let sprite = sprites["running"];

    context.fillStyle = "green";
    context.fillRect(mainCharacter.x, mainCharacter.y, sprite.w, sprite.y);

    mainCharacter.image.onload = () => {
        context.drawImage(
            mainCharacter.image,  // The image to draw
            sprite.x, sprite.y,     // The position of the sprite in the image
            sprite.w, sprite.h,     // The size of the sprite in the image
            mainCharacter.x, mainCharacter.y,  // The position on the canvas
            sprite.w, sprite.h  // The size on the canvas
        );
    }

}