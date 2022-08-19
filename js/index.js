
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1280;
canvas.height = 768;

c.fillStyle = 'blue';
c.fillRect(0, 0, canvas.width, canvas.height);



const placementTilesData2D = [];

for (let i = 0; i < placementTilesData.length; i+=20) {
    placementTilesData2D.push(placementTilesData.slice(i, i + 20));
}

const cellSize = 64;
const gameGrid = [];



function createGrid(){
    for (let y = 0; y < canvas.height; y += cellSize){
        for (let x = 0; x < canvas.width; x += cellSize){
            gameGrid.push(new Cell(x, y));
        }
    }
}

function handleGameGrid(){
    for (let i = 0; i < gameGrid.length; i++){
        gameGrid[i].draw();
    }
}



const placementTiles = [];

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


const image = new Image();

image.onload = () => {
    animate();
}
image.src = 'img/newMap.png';


// const stockBrokers = [];
const enemies = [];
const stockBroker = Broker;
const manager = HFManager;
let enemyCount = 3;

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

const buildings = [];
let activeTile = undefined;

spawnEnemies(enemyCount, stockBroker, 150);
spawnEnemies(enemyCount, manager, 250);

function collision(first, second){
    if (    !(  first.x > second.x + second.width ||
                first.x + first.width < second.x ||
                first.y > second.y + second.height ||
                first.y + first.height < second.y)
    ) {
        return true;
    };
};

const fireBuilding = {
    x: 1150,
    y: 10,
    width: 70,
    height: 85,
}

const waterBuilding = {
    x: 1070,
    y: 10,
    width: 70,
    height: 85,
}

let chosenBuilding; //DO NOT DELETE
// let fireRadius = 250;

let damage = Building.damage;

function removeEnemy() {
    for (let i = enemies.length -1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update();    

        if(enemy.position.x > canvas.width){
            console.log('lose life')
            enemies.splice(i,1);
            playerLives -= 1;
            lives.innerHTML = ('LIVES: ' + playerLives)
        }
        if(playerLives === 0) {
            cancelAnimationFrame(animateId);
        }
    }
    if(enemies.length === 0) {
        enemyCount = (enemyCount + 2);
        brokerOffset = (brokerOffset- 2);
        managerOffset = (managerOffset- 2);
        console.log('broker offset ' + brokerOffset);
        spawnEnemies(enemyCount, stockBroker, brokerOffset);
        spawnEnemies(enemyCount, manager, managerOffset);
    }
}

function placeTiles() {
    placementTiles.forEach((tile) => {
        tile.update(mouse);
    });
}

let brokerOffset = 150;
let managerOffset = 200;

function targetEnemy() {
    buildings.forEach((building) => {
        building.update();
        building.target = null;
        const validEnemies = enemies.filter((enemy) => {
            const xDifference = enemy.center.x - building.center.x;
            const yDifference = enemy.center.y - building.center.y;
            const distance = Math.hypot(xDifference, yDifference);
            return distance < enemy.radius + building.fireRadius
        })
        building.target = validEnemies[0];
        //console.log(validEnemies);

        for (let i = building.projectiles.length -1; i>= 0; i--) {
            const projectile = building.projectiles[i];
            projectile.update();
            
            const xDifference = projectile.enemy.center.x - projectile.position.x;
            const yDifference = projectile.enemy.center.y - projectile.position.y;
            const distance = Math.hypot(xDifference, yDifference);

            // projectile collision with enemy
            if (distance < projectile.enemy.radius + projectile.radius) {
                //enemy health calculation
                console.log(building.fireRadius);
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

createGrid();

let animateId;


function animate() {
    animateId = requestAnimationFrame(animate);
    //available function under window.requestAnimationFrame
    c.drawImage(image, 0, 0);
    handleGameGrid();   // creates grid layover for testing and dev purposes
    // brokerFunction();   // spawns broker enemies
    removeEnemy();    // spawns 'basic' enemies
    placeTiles();       //displays acceptable tile placement points  
    targetEnemy();      // handles targeting of 'basic' enemies
    // targetStockBroker(); //handles targeting of 'broker' enemies
    chooseBuilding();   // handles allowing player to choose type of building for placement.

}



//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~mouse tracking and event listeners~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//




const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1,
    clicked: false,
}

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


canvas.addEventListener('click', () => {
    chooseBuilding();
    if(activeTile && !activeTile.isOccupied && playerMoney >= towerCost) {
        buildings.push(
            new chosenTower({
                position: {
                    x: activeTile.position.x,
                    y: activeTile.position.y
                }
            })
        )
        activeTile.isOccupied = true;
        playerMoney -= towerCost;
        console.log(buildings);
        money.innerHTML = playerMoney;
    }
});

//~~START TESTING~~//

let chosenTower;
let towerCost;
let playerMoney = 100;
let playerLives = 50;

const money = document.getElementById('money');
const lives = document.getElementById('lives');

money.innerHTML = ('MONEY: ' + playerMoney);
lives.innerHTML = ('LIVES: ' + playerLives)

let moneyUpdate = () => {
    money.innerHTML = ('MONEY: ' + playerMoney);
};

function chooseBuilding(){
    let fireStroke = 'yellow';
    let waterStroke = 'black';
    
    let position = {
        x: mouse.x,
        y: mouse.y
    }
    const fireTower = new FireTower(position);
    const waterTower = new WaterTower(position);

    c.lineWidth = 3;
    c.fillStyle = 'rgba(0,0,0,0.4)'

    if(chosenBuilding === 1){
        fireStroke = 'white';
        waterStroke = 'black';
    } else if (chosenBuilding == 2){
        fireStroke = 'black';
        waterStroke = 'white';
    } else {
        fireStroke = 'black';
        waterStroke = 'black';
    }
    if (collision(mouse, fireBuilding) && mouse.clicked){
        chosenBuilding = 1;
        chosenTower = FireTower;
        towerCost = fireTower.cost;
    } else if (collision(mouse, waterBuilding) && mouse.clicked){
        chosenBuilding = 2;
        chosenTower = WaterTower;
        towerCost = waterTower.cost;
    }

    c.fillRect(fireBuilding.x, fireBuilding.y, fireBuilding.width, fireBuilding.height);
    c.strokeStyle = fireStroke;
    c.strokeRect(fireBuilding.x, fireBuilding.y, fireBuilding.width, fireBuilding.height);

    c.fillRect(waterBuilding.x, waterBuilding.y, waterBuilding.width, waterBuilding.height);
    c.strokeStyle = waterStroke;
    c.strokeRect(waterBuilding.x, waterBuilding.y, waterBuilding.width, waterBuilding.height);
};

//~~STOP TESTING~~//


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
    //console.log(activeTile);
})

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~END~~~~~~END~~~~~END~~~~~~END~~~~//
//~mouse tracking and event listeners~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//









// function targetStockBroker() {
//     buildings.forEach((building) => {
//         building.update();
//         building.target = null;

//         //targeting enemies using maths
//         const validEnemies = stockBrokers.filter((stockBroker) => {
//             const xDifference = stockBroker.center.x - building.center.x;
//             const yDifference = stockBroker.center.y - building.center.y;
//             const distance = Math.hypot(xDifference, yDifference);
//             return distance < stockBroker.radius + building.radius
//         })
//         building.target = validEnemies[0];
//         // console.log(validEnemies);

//         //creating projectiles to be deployed from buildings
//         for (let i = building.projectiles.length -1; i>= 0; i--) {
//             const projectile = building.projectiles[i];
//             projectile.update();
            
//             const xDifference = projectile.enemy.center.x - projectile.position.x;
//             const yDifference = projectile.enemy.center.y - projectile.position.y;
//             const distance = Math.hypot(xDifference, yDifference);

//             // projectile collision with stockBroker
//             if (distance < projectile.enemy.radius + projectile.radius) {
//                 //stockBroker health calculation
//                 projectile.enemy.health -= damage;
//                 if (projectile.enemy.health <= 0) {
//                     const stockBrokerIndex = stockBrokers.findIndex((stockBroker) => {
//                         return projectile.enemy === stockBroker
//                     })
                    
//                     if (stockBrokerIndex > -1) stockBrokers.splice(stockBrokerIndex, 1);
//                 }
//                 if(stockBrokers.length === 0) {
//                     spawnBrokers(enemyCount);
//                 }
//                 // console.log(projectile.enemy.health);
//                 building.projectiles.splice(i, 1);
//             }
//         }
//     })
// }

