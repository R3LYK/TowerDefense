
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1280;
canvas.height = 768;

c.fillStyle = 'blue';
c.fillRect(0, 0, canvas.width, canvas.height);

const image = new Image();

image.onload = () => {
    animate();
}
image.src = 'img/newMap.png';


class InputHandler {

}

class Projectile {
    constructor({position = {x: 0, y: 0}, enemy}) {
        this.position = position;
        this.velocity = {
            x: 0,
            y: 0
        }
        this.enemy = enemy;
        this.radius = 10;

        //testing start//
        this.chosenBuilding = chosenBuilding;
        this.damage = damage;
        //testing stop//
    }

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fill();
    }

    update() {
        this.draw();

        const angle = Math.atan2(
            this.enemy.center.y - this.position.y, 
            this.enemy.center.x - this.position.x
            )

        const power = 5;
        this.velocity.x = Math.cos(angle) * power;
        this.velocity.y = Math.sin(angle) * power;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y
    }
}

class Particle {

}

class Building {
    constructor({position = {x: 0, y: 0}}) {
        this.position = position;
        this.width = 64 * 2;
        this.height = 64;
        this.center = {
            x: this.position.x + this.width /2,
            y: this.position.y + this.height / 2
        }
        this.projectiles = [];
        this.target;
        this.frames = 0;
        //building specifics
        this.chosenBuilding = chosenBuilding;
        this.towerLevel = 1;
        this.fireRate = 1;
        this.radius = 250;
        
    }


    draw() {
        if(this.chosenBuilding === 1){
            c.fillStyle = 'red';
            c.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
            c.fillStyle = 'rgba(255, 0, 0, .2)'
            c.fill();
        } else if(this.chosenBuilding === 2){
            c.fillStyle = 'blue';
            c.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
            c.fillStyle = 'rgba(0, 0, 255, .2)'
            c.fill();
        }
        c.fillRect(this.position.x, this.position.y, this.width, 64);
        c.beginPath();
        
    }

    update() {
        this.draw();
        if(this.frames % 100 === 0 && this.target) {
            this.projectiles.push(
                new Projectile({
                    position: {
                        x: this.center.x,
                        y: this.center.y
                    },
                    enemy: this.target
                })
            );
        }

        this.frames++
    }

    targetEnemy() {
        buildings.forEach((building) => {
            building.update();
            building.target = null;
            const validEnemies = enemies.filter((enemy) => {
                const xDifference = enemy.center.x - building.center.x;
                const yDifference = enemy.center.y - building.center.y;
                const distance = Math.hypot(xDifference, yDifference);
                return distance < enemy.radius + building.radius
            })
            building.target = validEnemies[0];
            // console.log(validEnemies);
    
                // looping through projectiles array backwards
                // so that removal of projectiles from array
                // doesn't cause flickering due to skipping over index
                // after removal
            for (let i = building.projectiles.length -1; i >= 0; i--) {
                const projectile = building.projectiles[i];
                projectile.update();
                
                const xDifference = projectile.enemy.center.x - projectile.position.x;
                const yDifference = projectile.enemy.center.y - projectile.position.y;
                const distance = Math.hypot(xDifference, yDifference);
    
                // projectile collision with enemy
                if (distance < projectile.enemy.radius + projectile.radius) {
                    //enemy health calculation
                    projectile.enemy.health -= damage;
                    if (projectile.enemy.health <= 0) {
                        const enemyIndex = enemies.findIndex((enemy) => {
                            return projectile.enemy === enemy
                        })
                        
                        if (enemyIndex > -1) enemies.splice(enemyIndex, 1);
                    }
                    if(enemies.length === 0) {
                        spawnEnemies(enemyCount);
                    }
                    // console.log(projectile.enemy.health);
                    building.projectiles.splice(i, 1);
                }
            }
        })
    }
}

class FireTower extends Building {
    constructor() {
        this.projectiles = [];
        this.towerLevel = 1;
        this.fireRate = 1;
        this.radius = 250;
        this.color = 'rgba(245,12,73,0.8)';
    }
}

class Enemy {
    constructor({ position = {x: 0, y: 0}}) {
        this.position = position;
        this.width = 100;
        this.height = 100;
        this.waypointIndex = 0;
        this.center = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height /2
        }
        this.radius = 50;
        this.health = 100;
        this.markedForDeletion = false;

        this.enemies = [];
    }

    draw() {
        c.fillStyle = 'red';
        c.beginPath();
        c.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
        c.fill();

        // health
        c.fillStyle = 'red';
        c.fillRect(this.position.x, this.position.y - 15, this.width, 10);

        c.fillStyle = 'green';
        c.fillRect(this.position.x, this.position.y - 15, this.width * this.health / 100, 10);
    }

    update() {
        this.draw();

        const waypoint = waypoints[this.waypointIndex];
        const yDistance = waypoint.y - this.center.y;
        const xDistance = waypoint.x - this.center.x;
        const angle = Math.atan2(yDistance, xDistance);
        this.position.x += Math.cos(angle);
        this.position.y += Math.sin(angle);
        this.center = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height /2
        }

        if (
            Math.round(this.center.x) === Math.round(waypoint.x) && 
            Math.round(this.center.y) === Math.round(waypoint.y) &&
            this.waypointIndex < waypoints.length - 1
            ) {
            this.waypointIndex++
        }
    }

    spawnEnemies(x) {
        for (let i = 1; i < x.length; i++) {
            const xOffset = i * 150
            this.enemies.push(
                    new Enemy({
                    position: {x: waypoints[0].x - xOffset, y: waypoints[0].y}
                })
            )
        }
    }

    removeEnemy() {
        for (let i = this.enemies.length -1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update();    
        }
    }

}

class Brokers extends Enemy {

}

class Layer {

}

class PlacementTile {
    constructor({position = {x: 0, y: 0}}) {
        this.position = position;
        this.size = 64;
        this.color = 'rgba(255, 255, 255, .1)';
        this.occupied = false;
    };

    draw() {
        c.fillStyle = this.color;
        c.fillRect(this.position.x, this.position.y, this.size, this.size);
    };

    update(mouse) {
        this.draw()

        if (
            mouse.x > this.position.x && 
            mouse.x < this.position.x + this.size &&
            mouse.y > this.position.y && 
            mouse.y < this.position.y + this.size
        ) {
            // console.log('collision detected')
            this.color = 'white'
        } else {this.color = 'rgba(255, 255, 255, .1)';}
    };

    getPathing() {
        const placementTilesData2D = [];

        for (let i = 0; i < placementTilesData.length; i+=20) {
            placementTilesData2D.push(placementTilesData.slice(i, i + 20));
            }
    };

    allowBuilding() {
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
    };

    placeTiles() {
        placementTiles.forEach((tile) => {
            tile.update(mouse);
        });
    }
}


class Cell {
    constructor({ position = {x: 0, y: 0}}){
        this.position;
        this.width = 64;
        this.height = 64;
        this.gameGrid = [];
    }

    draw(){
        c.strokeStyle = 'black';
        c.lineWidth = .5;
        c.strokeRect(this.position.x, this.position.y, this.width, this.height);
    }

    createGrid(){
        for (let y = 0; y < canvas.height; y += this.width){
            for (let x = 0; x < canvas.width; x += this.width){
                this.gameGrid.push(new Cell(x, y));
            }
        }
    }

    handleGameGrid(){
        for (let i = 0; i < this.gameGrid.length; i++){
            this.gameGrid[i].draw();
        }
    }
}






class UI {

}


Cell.createGrid();
PlacementTile.getPathing();
PlacementTile.allowBuilding();

Enemy.spawnEnemies();

function animate() {
    requestAnimationFrame(animate); //available function under window.requestAnimationFrame

    c.drawImage(image, 0, 0);
    handleGameGrid();   // creates grid layover for testing and dev purposes
    // brokerFunction();   // spawns broker enemies
    Enemy.removeEnemy();    // removes 'basic' enemies
    PlacementTile.placeTiles();       //displays acceptable tile placement points  
    Building.targetEnemy();      // handles targeting of 'basic' enemies
    // targetStockBroker(); //handles targeting of 'broker' enemies
    chooseBuilding();   // handles allowing player to choose type of building for placement.

}




//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~~~~~~START GLOBAL VARIABLE~~~~~~~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//



let activeTile = undefined;
let damage;


const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1,
    clicked: false,
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~~~~~~~END GLOBAL VARIABLE~~~~~~~~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//




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


canvas.addEventListener('click', (event) => {
    if(activeTile && !activeTile.isOccupied) {
        buildings.push(
            new Building({
                position: {
                    x: activeTile.position.x,
                    y: activeTile.position.y
                }
            })
        )
        activeTile.isOccupied = true;
        console.log(buildings);
    }
})

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
