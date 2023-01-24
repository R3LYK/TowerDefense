
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

let chosenBuilding;

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
function collisionP(first, second){
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
            // console.log('lose life')
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
let seconds = 20;

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


function countSeconds(seconds) {
    seconds -= 1;
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

let icons2 = [
    {
    iconBuilding: FireTower,
    x: 900,
    y:  10,
    width: 70,
    height: 85
    },
    {
    iconBuilding: WaterTower,
    x: 990,
    y: 10,
    width: 70,
    height: 85
    },
    {
    iconBuilding: IceTower,
    x: 1080,
    y: 10,
    width: 70,
    height: 85
    },
    {
    iconBuilding: WindTower,
    x: 1170,
    y: 10,
    width: 70,
    height: 85
    }

]

function makeIconsGreatAgain() {

    icons2.forEach((icon) => {
        icon.push
        new UI (icons2.width, icons2.height, icons2.iconBuilding, icons2.x, icons2.y)
    })
}

let iconName;
let iconTowerType;
const tempArray = [];

function createIcons() {
    buildingIconArray.forEach((building) => {
        let x;
        let y = 10;
        
        if(building === FireTower){
            x = 900;
            iconName = 'FIRE';
            iconTowerType = 'firetower';
        } else if (building === WaterTower){
            x = 990;
            iconName = 'WATER';
            iconTowerType = 'watertower';

        } else if (building === IceTower){
            x = 1080;
            iconName = 'ICE';
            iconTowerType = 'icetower';

        } else if (building === WindTower){
            x = 1170;
            iconName = 'WIND';
            iconTowerType = 'windtower';

        }
        iconArray.push(
            new BuildingIcons(x, y, building)
        )  
    })
    //console.log(iconArray[0]);
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


    makeIconsGreatAgain();
};


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~mouse tracking and event listeners~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

canvas.addEventListener('mousedown', function(){
    mouse.clicked = true;
});

canvas.addEventListener('mouseup', function(){
    mouse.clicked = false;
});


let canvasPosition = canvas.getBoundingClientRect();

canvas.addEventListener('mousemove', function(e){
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
});

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

        if (collisionP(mouse, building)) {
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
        icon.update(mouse);
    });

    upgradeButtonsArray.forEach((btn) => {
        btn.update(mouse);
    })
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

        const mouseTracker = 
        mouse.x > ub.x &&
        mouse.x < ub.x + ub.width + 8 &&
        mouse.y > ub.y &&
        mouse.y < ub.y + ub.height + 8

        if(ub.buttonName === 'upgrade' || 
            ub.buttonName == 'move' || 
            ub.buttonName == 'sell'){
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

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~~EVENT LISTENER FOR MOST BUTTONS~~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//



window.addEventListener('click', (event) => {
    //~~BUILDING PLACEMENT FUNCTION~~//
    if(activeTile && !activeTile.isOccupied && playerMoney > towerCost) {
        buildings.push(
            new selectedIcon({
                position: {
                    x: activeTile.position.x,
                    y: activeTile.position.y
                }
            })
        );
        //console.log(buildings);
        activeTile.isOccupied = true;
        playerMoney -= towerCost;
        moneyUpdate();
        clickCount = 1;
        sleep(100).then(() => clickCount = 0);
    };
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
        }
    }
    // console.log(activeTile);
})

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~~SELECTED ICON INDICATOR~~~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

let selectedIcon;

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
            break
        }
        if (mouseTracker && mouse.clicked){
        }
    };
    selectedIcon = activeIcon.towerType;
    iconArray.forEach(icon => {
        if (icon.towerType === selectedIcon) {
            icon.selectedStroke = 'black';
            chosenTower = icon.towerType;
            chosenBuilding = 1;
            towerCost = waterTower.cost;
        } else {
            icon.selectedStroke = 'orange';
        }
    });
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~~UPGRADE MENU CREATION ONCLICK~~~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

let lifespan;

window.addEventListener('click', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    if(clickCount === 0){
        console.log(upgradeButtonsArray);
        clickCount = 1;
        for (let i = 0; i < buildings.length; i++) {
            const building = buildings[i];
            
            const mouseTracker = 
            mouse.x > building.position.x &&
            mouse.x < building.position.x + building.width + 8 &&
            mouse.y > building.position.y &&
            mouse.y < building.position.y + building.height + 8
            
            if (mouseTracker) {
                activeBuilding = building;
                sleep(2000).then(() => activeBuilding = null);
                break
            }
            if (mouseTracker && mouse.clicked){
            }
        };
    
        selectedBuilding = activeBuilding.towerType;
    
        iconArray.forEach(icon => {
            if (icon.iconTowerType === selectedBuilding) {
                width = icon.width;
                height = icon.height / 4;
                buttonPositionX = icon.x;
                buttonPositionY = icon.y + (height * 4) + 3;
            };
        });
    
        let cardbuttons = ['upgrade', 'move', 'sell'];
    
        //populate upgradeButtonsArray
        //this is where the information for drawUIs() is coming from [line: 467]
        cardbuttons.forEach((button) => {
            upgradeButtonsArray.push(
                new UI(width, height, button, buttonPositionX, buttonPositionY, lifespan)
            );
    
            //increase buttonPositionY by height
            buttonPositionY = buttonPositionY + height;
        });
    
        upgradeButtonsArray.push(building);
        console.log(upgradeButtonsArray);

    }
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~END~~~~~~END~~~~~END~~~~~~END~~~~//
//~mouse tracking and event listeners~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//