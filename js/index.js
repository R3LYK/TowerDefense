
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

//~~starts animation loop & loads map image~~//
image.onload = () => {
    animate();
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

//~~function for detecting mouse collision for x and y variables~~//
function collision(first, second){
    if (first.x > second.x &&
        first.x < second.x + second.width &&
        first.y > second.y &&
        first.y < second.y + second.height) {
        return true;
    };
};

//~~function for detecting mouse collision for position object (position = {x:x, y:y}~~//
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

//~~~~~~~~~~SLEEP FUNCTION FOR DELAYING ACTIONS~~~~~~~~~~//
//~~Example: [sleep(1000).then(() => clickCount = 0);]~~//
//~~Example[2]: console.log("Check"); 
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


let gameState = 'running';

const sortedEnemiesTest = [];

let nextRound = document.getElementById('next_round');

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
            gameState = 'not running';
            document.querySelector('#game_over').style.display = 'flex';
        }
    }
    if(enemies.length === 0) {
        enemyCount = (enemyCount + 2);
        brokerOffset = (brokerOffset- 2);
        managerOffset = (managerOffset- 2);
        // console.log('broker offset ' + brokerOffset);
        spawnEnemies(enemyCount, stockBroker, brokerOffset);
        spawnEnemies(enemyCount, manager, managerOffset);
        round += 1;
        console.log('ROUND: ' + round);
    }
}

function roundDelay() {
    if(round > 1 && enemyCount === 0){
        
    }
};

function placeTiles() {
    placementTiles.forEach((tile) => {
        tile.update(mouse);
    });
};

function drawIcons() {
    iconArray.forEach((icon) => {
        icon.update(mouse);
    });
};  

function targetEnemy() {

    buildings.forEach((building) => {
        building.update();
        building.target = null;
        
        const validEnemies = enemies.filter((enemy) => {
            const xDifference = enemy.center.x - building.center.x;
            const yDifference = enemy.center.y - building.center.y;
            const distance = Math.hypot(xDifference, yDifference);
            return distance < enemy.radius + building.fireRadius
        });

        building.target = validEnemies[0];

        for (let i = building.projectiles.length -1; i>= 0; i--) {
            const projectile = building.projectiles[i];
            projectile.update();
            
            const xDifference = projectile.enemy.center.x - projectile.position.x;
            const yDifference = projectile.enemy.center.y - projectile.position.y;
            const distance = Math.hypot(xDifference, yDifference);

            // projectile collision with enemy
            if (distance < projectile.enemy.radius + projectile.radius) {
                //enemy health calculation
                // console.log(building.fireRadius);
                projectile.enemy.health -= building.damage;
                if (projectile.enemy.health <= 0) {
                    const enemyIndex = enemies.findIndex((enemy) => {
                        playerMoney += enemy.money;
                        moneyUpdate();
                        return projectile.enemy === enemy;
                    })
                    
                    if (enemyIndex > -1) enemies.splice(enemyIndex, 1);
                }
                // console.log(projectile.enemy.health);
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

function createIcons() {
    buildingIconArray.forEach((building) => {
        let x;
        let y = 10;
        
        if(building === FireTower){
            x = 900;
            iconName = 'FIRE';
        } else if (building === WaterTower){
            x = 990;
            iconName = 'WATER';
        } else if (building === IceTower){
            x = 1080;
            iconName = 'ICE';
        } else if (building === WindTower){
            x = 1170;
            iconName = 'WIND';
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

function animate() {
    animateId = requestAnimationFrame(animate);
    //available function under window.requestAnimationFrame
    c.drawImage(image, 0, 0);
    handleGameGrid();   // creates grid layover for testing and dev purposes
    removeEnemy();    // removes enemies if health === 0
    placeTiles();       //displays acceptable tile placement points  
    targetEnemy();   // handles targeting of 'basic' enemies
    drawIcons(); // Draws icons
    drawUpgradeButtons();



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

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~BUILDING PLACEMENT FUNCTION~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
canvas.addEventListener('click', () => {
    if(activeTile && !activeTile.isOccupied && playerMoney > towerCost) {
        buildings.push(
            new selectedIcon({
                position: {
                    x: activeTile.position.x,
                    y: activeTile.position.y
                }
            })
        )
        activeTile.isOccupied = true;
        playerMoney -= towerCost;
        moneyUpdate();
        console.log(buildings);
        clickCount = 1;
        sleep(100).then(() => clickCount = 0);
    }
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~SELECT BUILDING FOR UPGRADE/SELL~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

let selectedTower;
let buttonPositionX;
let buttonPositionY;

const upgradeButtonsArray = [];

function drawUpgradeButtons() {
    upgradeButtonsArray.forEach((btn) => {
        if(btn.objectName === 'upgradeBtn'){
            btn.drawBtn();
        }
    });
};  

window.addEventListener('click', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    let btn;
    let tower;
    
    for (let i = 0; i < buildings.length; i++) {
        const building = buildings[i];
         
        if ( 
            clickCount === 0 && collisionP(mouse, building)
        ) {
            buttonPositionX = building.position.x + 35;
            buttonPositionY = building.position.y + 66;
            upgradeButtonsArray[0] = new UpgradeButton;
            upgradeButtonsArray[1] = building;
            console.log(upgradeButtonsArray);
            } 
            btn = upgradeButtonsArray[0];
            tower = upgradeButtonsArray[1];
        if (mouse.x > btn.x &&
            mouse.x < btn.x + btn.width &&
            mouse.y > btn.y &&
            mouse.y < btn.y + btn.height)
        {
            tower.towerLevel += 1;
            tower.damage += 5;
            tower.fireRadius += 50;
            playerMoney = (playerMoney - 10000);
            moneyUpdate();
            console.log(tower.towerLevel);
        }
    } 
        
    console.log(upgradeButtonsArray);
    console.log('x = ' + mouse.x);
    console.log('y = ' + mouse.y);
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
        const mouseTracker = mouse.x > icon.x &&
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
    isSelected();
    // console.log('selectedIcon = ' + selectedIcon); 
});

let activeTower;

canvas.addEventListener('click', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    for (let i = 0; i < buildings.length; i++) {
        const tower = buildings[i];
        
        const mouseTracker = 
        mouse.x > tower.position.x &&
        mouse.x < tower.position.x &&
        mouse.y > tower.position.y &&
        mouse.y < tower.position.y

        if (mouseTracker){
            activeTower = tower;
        }
        if (mouseTracker && mouse.clicked){
        }
    //console.log(activeTower.towerType)
    };

    //console.log(activeTower);
});

function isSelected() {
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
    // console.log(chosenTower);
};
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~END~~~~~~END~~~~~END~~~~~~END~~~~//
//~mouse tracking and event listeners~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//