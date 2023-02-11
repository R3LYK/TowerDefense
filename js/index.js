
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1280;
canvas.height = 768;

c.fillStyle = 'blue';
c.fillRect(0, 0, canvas.width, canvas.height);

//~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~~~GLOBAL VARIABLES~~~~~//
let chosenTower;
let towerCost;
let playerMoney = 200000;
let playerLives = 50;
let radiusColor = 'rgba(255, 255, 255, 0.2)';


lastTime = 0;

zeroPos = {x: 0, y: 0};

const enemies = [];
const stockBroker = Broker;
const manager = HFManager;
let enemyCount = 3;
let round = 0;

const buildings = [];
let activeTile = undefined;


let damage = Building.damage;
let brokerOffset = 150;
let managerOffset = 200;
let animateId;
const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1,
    clicked: false,
    clicked2: false,
    hover: false,
};

const image = new Image();

const money = document.getElementById('money');
const lives = document.getElementById('lives');
let moneyUpdate = () => {
    money.innerHTML = ('MONEY: ' + playerMoney);
};
const cellSize = 64;
const gameGrid = [];

const placementTilesData2D = [];
const placementTiles = [];

let upgradeButtonsArray = [];
let contextMenuArray = [];

//~~starts animation loop & loads map image~~//
image.onload = () => {
    animate(0);
}
image.src = 'img/newMap.png';

//~~~~~creating array of arrays representing 'tiles' using placementTileData array~~~~~//
for (let i = 0; i < placementTilesData.length; i+=20) {
    placementTilesData2D.push(placementTilesData.slice(i, i + 20));
};

//~~inserting allowed placement tiles from placementTile data arrays^2~~//
placementTilesData2D.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if (symbol === 14) {
            //add building placement tile here
            placementTiles.push(
                new PlacementTile({
                    position: {
                        x: x * 64,
                        y: y * 64
                    }
                })
            )
        }
    })
});

            //~~~~~~~~~~~~~~~~~~~~~~~//
            //~~REUSABLE FUNCTIONS~~//
            //~~~~~~~~~~~~~~~~~~~~~~//

//reset building.isOccupied to 'false', so that new buildings can be placed there.
function resetPlacementTile (building) {
    placementTiles.forEach((tile) => {
        if (tile.position.x === building.position.x && tile.position.y === building.position.y) {
            tile.isOccupied = false;
        };
    });
};

// I think this has to do with targetting?? 
function insertAt(array, index, ...elementsArray) {
    array.splice(index, 0, ...elementsArray);
};

//~~function for detecting mouse collision with object in canvas using x and y variables~~//
function collision(first, second){
    if (first.x > second.x &&
        first.x < second.x + second.width &&
        first.y > second.y &&
        first.y < second.y + second.height) {
        return true;
    };
};

//~~function for detecting mouse collision with object in canvas using 'position object (position = {x:x, y:y}~~//
//Only 'Buildings' and placementTiles use this format. Should have been more consistent...
//throwing it on the 'will fix later' pile.
function collisionWithPosition(first, second){
    if ( 
        first.x > second.position.x && 
        first.x < second.position.x + second.width &&
        first.y > second.position.y && 
        first.y < second.position.y + second.height
    ) {
        return true;
    };
};

//~~~~~~~~~~SLEEP FUNCTION FOR DELAYING ACTIONS~~~~~~~~~~~//
//~~Example: [sleep(1000).then(() => clickCount = 0);]~~~//
//~~Example[2]: console.log("Check"); ~~~~~~~~~~~~~~~~~~~//
//~~[2]: sleep(2000).then(() => { console.log("Mate!!!"); });
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

//~~~~~~~~~~~~~//
//~~FUNCTIONS~~//
//~~~~~~~~~~~~~//

//~~calculating grid (temporary for dev purposes)~~//
function createGrid(){
    for (let y = 0; y < canvas.height; y += cellSize){
        for (let x = 0; x < canvas.width; x += cellSize){
            gameGrid.push(new Cell(x, y));
        };
    };
};

//~~draws game grid (temporary for dev purposes)~~//
function handleGameGrid(){
    for (let i = 0; i < gameGrid.length; i++){
        gameGrid[i].draw();
    };
};

function spawnEnemies (enemyCount, enemyType, offSet) {
    
    for (let i = 1; i < enemyCount; i++) {
        const xOffset = i * offSet
        enemies.push(
                new enemyType({
                position: {x: waypoints[0].x - xOffset, y: waypoints[0].y}
            })
        )
    }
};

let gameRunning = true;
let roundStart = true;

roundDelay();

function removeEnemy() {
    for (let i = enemies.length -1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update();    

        if(enemy.position.x > canvas.width){
            enemies.splice(i,1);
            playerLives -= 1;
            lives.innerHTML = ('LIVES: ' + playerLives)
        }
        if(playerLives === 0) {
            cancelAnimationFrame(animateId);
            gameRunning = false;
            document.querySelector('#game_over').style.display = 'flex';
        }
    }
    if(enemies.length === 0) {
        round += 1; 
        enemyCount += 2;
        brokerOffset -= 2;
        managerOffset -= 2;
        console.log('ROUND: ' + round);
        spawnEnemies(enemyCount, stockBroker, brokerOffset);
        spawnEnemies(enemyCount, manager, managerOffset);
        roundDelay();
    }
};
let baseSpeed = 1;

let speed = baseSpeed;

//Made these while trying to get a counter to work,
//but everything kept getting messed up. Stupid animate function...
let nextRound = document.getElementById('next_round');


//Hacky way to create a delay by slowing the speed of enemies,
//while they're travelling from waypoint[0] -> [1],
//which is off screen.

//future me here. I'm pretty sure this functionality is built into the game loop via animate.
//I can probably call something like animatePause() and animateResume() to pause the game loop.
//past me was too lazy to read the docs. He's a jerk.

function roundDelay() {
    if(round > 1){
        speed = .05;
        sleep(20000).then(() => speed = 1);
    }
};

function placeTiles() {
    placementTiles.forEach((tile) => {
        tile.update(mouse);
    });
};

let sortedEnemiesTest = [];

function sortEnemies() {
    sortedEnemiesTest = enemies.sort((a, b) => {
        return b.position.x - a.position.x;
    });
};

function targetEnemy() {

    buildings.forEach((building) => {
        building.update();
        building.target = null;
        
        let validEnemies = sortedEnemiesTest.filter((enemy) => {
            const xDifference = enemy.center.x - building.center.x;
            const yDifference = enemy.center.y - building.center.y;
            const distance = Math.hypot(xDifference, yDifference);
            return distance < enemy.radius + building.fireRadius
        });

        let targetLast = validEnemies[validEnemies.length - 1];
        let targetFirst = validEnemies[0];

        building.target = targetLast;

        if (building.towerType === 'watertower') {
            if (building.specialTimer > building.specialInterval) {
                validEnemies.forEach((enemy) => {
                    building.radiusColor = 'rgba(1, 255, 255, 0.5)';
                    sleep(500).then(() => building.radiusColor = 'rgba(255, 255, 255, .3)');
                    enemy.speed = .5;
                    building.specialTimer = 0;
                    sleep(6000).then(() => enemy.speed = baseSpeed);
                });
            } else {
                building.specialTimer += deltaTime;
            }
        }
    
        for (let i = building.projectiles.length -1; i>= 0; i--) {
            const projectile = building.projectiles[i];
            projectile.update();
            
            const xDifference = projectile.enemy.center.x - projectile.position.x;
            const yDifference = projectile.enemy.center.y - projectile.position.y;
            const distance = Math.hypot(xDifference, yDifference);

          
            if (distance < projectile.enemy.radius + projectile.radius) {
                
                projectile.enemy.health -= building.damage;
                if (projectile.enemy.health <= 0) {
                    const enemyIndex = enemies.findIndex((enemy) => {
                        playerMoney += enemy.money;
                        moneyUpdate();
                        return projectile.enemy === enemy;
                    })
                    
                    if (enemyIndex > -1) enemies.splice(enemyIndex, 1);
                }
                building.projectiles.splice(i, 1);
            }
        }
    })
}


const iconArray = [];
const fireTower = new FireTower(zeroPos);
const waterTower = new WaterTower(zeroPos);
const iceTower = new IceTower(zeroPos);
const windTower = new WindTower(zeroPos);

let buildingIconArray = [FireTower, WaterTower, IceTower, WindTower];



let iconName;
let towerType;
const tempArray = [];

function createIcons() {
    buildingIconArray.forEach((building) => {
        let width = 70;
        let height = 85;
        let positionX;
        let positionY = 10;
        let lineWidth = 3;
        let textColor = 'white';
        let textColor2 ='offwhite';
        let fill = '#74B3CE';
        let onActionFill = '#59A4C5';
        let lineColor = '#25556A';
        let onActionLineColor = '#1B3D4B';
        if(building === FireTower){
            positionX = 900;
            buttonName = 'fireTower';
            towerType = building;
        } else if (building === WaterTower){
            positionX = 990;
            buttonName = 'waterTower';
            towerType = building;
        } else if (building === IceTower){
            positionX = 1080;
            buttonName = 'iceTower';
            towerType = building;
        } else if (building === WindTower){
            positionX = 1170;
            buttonName = 'windTower';
            towerType = building;
        }
        iconArray.push(
            new UI(buttonName, towerType, width, height, positionX, positionY,
                   lineWidth, textColor, textColor2, fill, onActionFill, lineColor, onActionLineColor)
        )
    })
};

//~~Calling all functions for creating map, UI, and running game~~//
//~~Eventually this all needs to be refactored into a loop that runs-
//~~for the entirety of the game~~//

createGrid();
createIcons();

let deltaTime;

function animate(timeStamp) {

    deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    animateId = requestAnimationFrame(animate);
    sortEnemies();
    //available function under window.requestAnimationFrame
    c.drawImage(image, 0, 0);
    handleGameGrid();   // creates grid layover for testing and dev purposes
    removeEnemy();    // removes enemies if health === 0
    placeTiles();       //displays acceptable tile placement points  
    targetEnemy();   // handles targeting of 'basic' enemies
    drawIcons(); // Draws icons
    drawUIs();
};


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~mouse tracking and event listeners~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

canvas.addEventListener('mousedown', function(e){
    mouse.clicked = true;
});

canvas.addEventListener('mouseup', function(){
    mouse.clicked = false;
});

let canvasPosition = canvas.getBoundingClientRect();

canvas.addEventListener('mouseleave', function(){
    mouse.y = undefined;
    mouse.y = undefined;
});

let clickCount = 0;

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~RIGHT CLICK BUILDING TO CHOOSE TARGETING ORDER~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

canvas.addEventListener('contextmenu', function(e){
    e.preventDefault();
    mouse.clicked2 = true;
    
    for (let i = 0; i < buildings.length; i++) {
        const building = buildings[i];

        buttonPositionX = building.position.x;
        buttonPositionY = building.position.y + building.height;
        let buttonName = 'contextMenu';

        //Detecting collison with building
        //and displaying targeting buttons
        //then allowing 4 seconds to choose
        //because I'm not smart enough to figure
        //out how to only display only while mouse within x,y
        //maybe future me can...god speed future me, you sucker

        if (collisionWithPosition(mouse, building)) {
            contextMenuArray[0] = new UI(building.width, building.height, buttonName, buttonPositionX, buttonPositionY);
            sleep(4000).then(() => contextMenuArray.splice(0, 1));
            
        } 
    }

});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~SELECT BUILDING FOR UPGRADE/SELL~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

let selectedTower;
let buttonPositionX  = 0;
let buttonPositionY = 0;

//these functions are always running in the animate loop
//so special precautions are needed to prevent
//calling a method on an undefined object

let md;

function drawIcons() {
    iconArray.forEach((icon) => {
        icon.drawIcon();
        icon.iconUpdate(mouse);
    });

    upgradeButtonsArray.forEach((btn) => {
        btn.btnUpdate(mouse);
    });

    // buildings.forEach((building) => {
    //     building.dragAndDrop(mouse, activeBuilding);
    // });
};  

function drawContextMenu() {
    contextMenuArray.forEach((contextMenu) => {
        // PLACEHOLDER___contextMenu.update(mouse);
    });
};

function drawUIs() {
    //looping through upgradeButtonsArray and calling UI method drawBtn() 
    //to create and render the buttons. Works with the 'event listener' below

    for (let i = 0; i < upgradeButtonsArray.length; i++) {
        const ub = upgradeButtonsArray[i];
        const bn = ub.buttonName;

        switch(bn){
            case 'upgrade':
            case 'move':
            case 'sell':
                ub.drawBtn();
        }
    }
    //this needs refactored once I get around to the context menu
    //the solution above for buttons is much cleaner, and will
    //be easier to add more functionality later without rewriting
    //you're welcome future me

    contextMenuArray.forEach((menu) => {
        if(btn.buttonName === 'upgradeBtn'){
            menu.drawContextMenu();
        }
    })
};  



let btn = new UI; //this is temporarily(lol) handling an error with btn being undefined
let moveBtn = new UI;
let tower = null;

//****************************//
//****************************//
//***EVENT_LISTENER'S_BELOW***//
//****************************//
//****************************//

            //~~~~~~~~~~~~~~~~~~~~~~~//
            //~~BUILDING PLACEMENT~~//
            //~~~~~~~~~~~~~~~~~~~~~~//

window.addEventListener('click', () => {
    //~~BUILDING PLACEMENT FUNCTION~~//
    if (selectedIcon != null){
        if(activeTile && !activeTile.isOccupied && playerMoney > towerCost) {
            buildings.push(
                new selectedIcon({
                    position: {
                        x: activeTile.position.x,
                        y: activeTile.position.y
                    }
                })
            );
            activeTile.isOccupied = true;
            playerMoney -= towerCost;
            moneyUpdate();
            clickCount = 1;
            sleep(100).then(() => clickCount = 0);
            selectedIcon = null;
        };
    }
});

money.innerHTML = ('MONEY: ' + playerMoney);
lives.innerHTML = ('LIVES: ' + playerLives)

            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
            //~~ALLOWED PLACEMENT INDICATOR~~//
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    
    activeTile = null;
    for (let i = 0; i < placementTiles.length; i++) {
        const tile = placementTiles[i];
        if (
            mouse.x > tile.position.x && 
            mouse.x < tile.position.x + tile.size &&
            mouse.y > tile.position.y && 
            mouse.y < tile.position.y + tile.size
        ) {
            activeTile = tile;
            break
        };
    };
})

            //~~~~~~~~~~~~~~~~~~~~~~~~~~~//
            //~~SELECTED ICON INDICATOR~~//
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~//

let selectedIcon = null;
//aaa
window.addEventListener('click', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    

    for (let i = 0; i < iconArray.length; i++) {
        const icon = iconArray[i];
        const mouseTracker = 
        mouse.x > icon.x &&
        mouse.x < icon.x + icon.width + 8 &&
        mouse.y > icon.y &&
        mouse.y < icon.y + icon.height + 8
        
        if (mouseTracker) {
            activeIcon = icon;
            selectedIcon = activeIcon.towerType;
            break
        }
        if (mouseTracker && mouse.clicked){
        }
    };
    
    iconArray.forEach(icon => {
        if (icon.towerType === selectedIcon) {
            icon.selectedStroke = 'blue';
            towerCost = waterTower.cost;
        } else {
            icon.selectedStroke = 'orange';
        }
    });
});

            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
            //~~ALL THINGS UPGRADE MENU~~//
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~//

let lifespan;
let activeBuilding = [];


window.addEventListener('click', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    
    let iconMenu = ['upgrade', 'move', 'sell'];
    let lineWidth = 3;
    let textColor = 'white';
    let textColor2 ='offwhite';
    let fill = '#74B3CE';
    let onActionFill = '#4092B5';
    let lineColor = '#25556A';
    let onActionLineColor = '#1B3D4B';

    if(clickCount === 0){
        clickCount = 1;
        sleep(400).then(() => clickCount = 0);

        //creates upgrade menu.

        buildings.forEach((building) => {
             if (collisionWithPosition(mouse, building)) {
                activeBuilding = building;
                console.log(activeBuilding.position.x, activeBuilding.position.y);
                
                iconArray.forEach(icon => {
                    if (icon.buttonName.toLowerCase() === activeBuilding.towerType) {
                        width = icon.width;
                        height = icon.height / 4;
                        buttonPositionX = icon.x;
                        buttonPositionY = icon.y + (height * 4) + 3;
                    };
                });

                //populates upgradeButtonsArray.
                iconMenu.forEach((button) => {
                    upgradeButtonsArray.push(
                        new UI(button, activeBuilding.towerType, width, height, buttonPositionX, buttonPositionY,
                               lineWidth, textColor, textColor2, fill, onActionFill, lineColor, onActionLineColor)
                    );
                    //increase buttonPositionY by height.
                    buttonPositionY = buttonPositionY + height;
                });
            };
        });

        //handles the upgrade menu on_click actions 'upgrade', 'move', 'sell'.
        for (let btn of upgradeButtonsArray) {
            if (collision(mouse, btn)) {
                btn = btn.buttonName;

                switch(btn) {
                    case 'upgrade':
                        console.log('upgrade');
                        //just examples of what needs updated on upgrade. Will need balanced later.
                        activeBuilding.towerLevel += 1;
                        activeBuilding.damage += 1;
                        activeBuilding.fireRadius += 3;
                        activeBuilding.fireRate += 1;
                        upgradeButtonsArray = [];
                        break;
                    case 'move':
                        console.log('move');
                        activeBuilding.canBeMoved = true;
                        dragging = true;
                        break;
                    case 'sell':
                        console.log('sell');
                        buildings.splice(buildings.indexOf(activeBuilding), 1);
                        upgradeButtonsArray = [];

                        
                        resetPlacementTile(activeBuilding);
                        //another placeholder that will need balancing. Need to adjust for cost of upgrades too probably.
                        playerMoney += activeBuilding.cost / 2;
                        break;
                }
            }
        }           
    };
});

            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
            //~~3 EVENT LISTENERS FOR MOVING BUILDINGS~~//
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

//I feel like there's a better way to do this, but I'm just happy it works.
//Future me can deal with pesky effeciency issues, I already cleaned up past me's mess with this one.


let originalPosition;
let originalCenter;
let dragging = false;
let beingDragged = false;


//handles assingments for movable buildings, 
//and stores original position in case something goes wrong or cancelled *!(need to add a 'cancel' feature).

window.addEventListener('mousedown', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    if (dragging) {
        for (building of buildings) {
            if (collisionWithPosition(mouse, building) && building.canBeMoved) {
                
                originalPosition = {
                    x: building.position.x,
                    y: building.position.y
                };
                originalCenter = {
                    x: building.center.x,
                    y: building.center.y
                };

                building.isMoving = true;
                beingDragged = true;
            };
        };
    };
});



//handles the movement of the building while dragging.
canvas.addEventListener('mousemove', function(e){

    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;

    if (beingDragged) { 
        for (b of buildings) {
            if (b.isMoving) {
                resetPlacementTile(b);
                b.position = {
                    x: mouse.x - (b.width / 2),
                    y: mouse.y - (b.height / 2)
                };
                b.center = {
                    x: mouse.x,
                    y: mouse.y
                };
            };
        };
    };

});

//handles the release of the building, and checks if it's in a valid position, 
//if not, it resets to original position.


//BUG: [1] if a building is dropped over a non-active tile, and reverts to it's OG position,
//it does not reset the tile to it's original state. Meaning, you can stack buildings on top of each other.
canvas.addEventListener('mouseup', function(e){

    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;

    if (beingDragged) {
        for (b of buildings) {
            if (b.isMoving) {
                
                if (activeTile === null || activeTile.isOccupied) {
                    //BUG [1] is in here.

                    b.position = {
                        x: originalPosition.x,
                        y: originalPosition.y
                    };

                    b.center = {
                        x: originalCenter.x,
                        y: originalCenter.y
                    };

                    b.isMoving = false;
                    b.canBeMoved = false;
                    activeTile.isOccupied = true;
                    dragging = false;
                    beingDragged = false;

                } else if (activeTile != null || !activeTile.isOccupied) {
                    
                    b.position = {
                        x: activeTile.position.x,
                        y: activeTile.position.y
                    };

                    b.center = {
                        x: b.position.x + b.width/2,
                        y: b.position.y + b.height/2
                    };

                    b.isMoving = false;
                    b.canBeMoved = false;
                    activeTile.isOccupied = true;
                    dragging = false;
                    beingDragged = false;

                };
            }; 
        };
    };
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~END~~~~~~END~~~~~END~~~~~~END~~~~//
//~mouse tracking and event listeners~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//