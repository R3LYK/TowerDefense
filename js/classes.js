//copied to refactoring//

class PlacementTile {
    constructor({position = {x: 0, y: 0}}) {
        this.position = position;
        this.size = 64;
        this.width = 64;
        this.height = 64;
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
            this.color = 'white';
        } else {
            this.color = 'rgba(25, 29, 255, .1)';
        }
    };
};

class BuildingIcons {
    constructor(x, y, building){
        this.x = x;
        this.y = y;
        this.width = 70;
        this.height = 85;
        this.size = (this.width * 2) + (this.height * 2);
        this.towerType = building;
        this.iconName = iconName;
        this.color = 'rgba(0,0,0,0.4)';
        this.selectedStroke = 'orange';
        this.isSelected = false;
        
    };

    draw() {
        c.lineWidth = 3;
        c.fillStyle = this.color;
        c.fillRect(this.x, this.y, this.width, this.height);
        c.strokeStyle = this.selectedStroke;
        c.strokeRect(this.x, this.y, this.width, this.height);
        
        // c.shadowColor = 'yellow';
        // c.shadowBlur = 5;

        c.font = '16px Arial';
        c.fillStyle = 'black';
        c.fillText(this.iconName, this.x + 10, this.y + 45)//TEMP TEMP TEMP//
    };

    update(mouse) {
        this.draw()
        const mouseDetection = (
            mouse.x > this.x && 
            mouse.x < this.x + this.width &&
            mouse.y > this.y && 
            mouse.y < this.y + this.height)

        if  (mouseDetection){
            this.color = 'rgba(25, 255, 255, .4)';
        } else {
            this.color = 'rgba(25, 255, 255, .2)';
        }
        
    };

};

//copied to refactoring//
class Cell {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    };

    draw(){
        c.strokeStyle = 'black';
        c.lineWidth = .5;
        c.strokeRect(this.x, this.y, this.width, this.height);
    };
};


class Enemy {
    constructor({ position = {x: 0, y: 0}}) {
        this.position = position;
        this.height = 100;
        this.width = 100;
        this.waypointIndex = 0;
        this.center = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height /2
        };
        this.velocity = {
            x: 0,
            y: 0
        };

    };

    draw() {
        c.beginPath();
        c.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.fill();

        // health
        c.fillStyle = 'red';
        c.fillRect(this.position.x, this.position.y - 15, this.width, 10);

        c.fillStyle = 'green';
        c.fillRect(this.position.x, this.position.y - 15, this.width * this.health / this.n, 10);
    };

    update() {
        this.draw();

        const waypoint = waypoints[this.waypointIndex];
        const yDistance = waypoint.y - this.center.y;
        const xDistance = waypoint.x - this.center.x;
        const angle = Math.atan2(yDistance, xDistance);

        const speed = 1;

        this.velocity.x = Math.cos(angle);
        this.velocity.y = Math.sin(angle);
        
        this.position.x += this.velocity.x * speed;
        this.position.y += this.velocity.y * speed;
        this.center = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height /2
        };

        if (
            Math.abs(Math.round(this.center.x) - Math.round(waypoint.x)) < 
                Math.abs(this.velocity.x * 3) && 
            Math.abs(Math.round(this.center.y) - Math.round(waypoint.y)) <
                Math.abs(this.velocity.y * 3) &&
            this.waypointIndex < waypoints.length - 1
            ) {
            this.waypointIndex++
        };
    };
};

class Broker extends Enemy {
    constructor({ position = {x: 0, y: 0}}) {
        super(Enemy);
        this.position = position;
        this.radius = 30;
        this.health = 50;
        this.n = 50;
        
        this.color = 'black';

        this.money = 50;
    }
}

class HFManager extends Enemy {
    constructor({ position = {x: 0, y: 0}}) {
        super(Enemy);
        this.position = position;
        this.radius = 40;
        this.health = 100;
        this.n = 100;
        this.color = 'rgb(69, 26, 16)';

        this.money = 100;
    }
}



class Building {
    constructor({position = {x: 0, y: 0}}) {
        this.position = position;
        this.width = 64 * 2;
        this.height = 64;
        this.center = {
            x: this.position.x + this.width /2,
            y: this.position.y + this.height / 2
        };
        this.projectiles = [];
        this.target;
        this.frames = 0;
        this.chosenBuilding = chosenBuilding;
        this.fireRate = 30; //lower number = higher fire rate
        // this.radius = fireRadius;
    };


    draw() {
            c.fillStyle = this.color;
            c.fillRect(this.position.x, this.position.y, this.width, 64);
            
            c.beginPath();
            c.arc(this.center.x, this.center.y, this.fireRadius, 0, Math.PI * 2);
            c.fillStyle = 'rgba(255, 255, 255, .3)';
            c.fill();
            
            c.font = '12px Arial';
            c.fillStyle = 'black';
            c.fillText(this.towerType, this.position.x + 40, this.position.y + 15)
            
            c.font = '12px Arial';
            c.fillStyle = 'black';
            c.fillText(('level: ' + this.towerLevel), this.position.x + 40, this.position.y + 30)

            c.font = '12px Arial';
            c.fillStyle = 'black';
            c.fillText(('damage: ' + this.damage), this.position.x + 40, this.position.y + 45)
    }

    // drawRadius() {
        
    // };

    update() {
        this.draw();
        if(this.frames % this.fireRate === 0 && this.target) {
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

};

class WaterTower extends Building {
    constructor({position = {x: 0, y: 0}}) {
        super(Building);
        this.position = position;
        this.width = 64 * 2;
        this.height = 64;
        this.center = {
            x: this.position.x + this.width /2,
            y: this.position.y + this.height / 2
        };
        this.target;
        this.frames = 0;


        this.towerType = 'waterTower';
        this.towerLevel = 1;
        this.color = 'blue';
        this.fireRadius = 175;
        this.damage = 20;
        this.cost = 1500;
    };
};

class FireTower extends Building {
    constructor({position = {x: 0, y: 0}}) {
        super(Building);
        this.position = position;
        this.width = 64 * 2;
        this.height = 64;
        this.center = {
            x: this.position.x + this.width /2,
            y: this.position.y + this.height / 2
        };
        
        this.target;
        this.frames = 0;


        this.towerType = 'fireTower';
        this.towerLevel = 1;
        this.color = 'red';
        this.fireRadius = 250;
        this.damage = 10;
        this.cost = 1000;
    };
};

class IceTower extends Building {
    constructor({position = {x: 0, y: 0}}) {
        super(Building);
        this.position = position;
        this.width = 64 * 2;
        this.height = 64;
        this.center = {
            x: this.position.x + this.width /2,
            y: this.position.y + this.height / 2
        };
        
        this.target;
        this.frames = 0;


        this.towerType = 'iceTower';
        this.towerLevel = 1;
        this.color = 'purple';
        this.fireRadius = 225;
        this.damage = 10;
        this.cost = 1000;
    };
};

class WindTower extends Building {
    constructor({position = {x: 0, y: 0}}) {
        super(Building);
        this.position = position;
        this.width = 64 * 2;
        this.height = 64;
        this.center = {
            x: this.position.x + this.width /2,
            y: this.position.y + this.height / 2
        };
        
        this.target;
        this.frames = 0;

        this.towerType = 'windTower';
        this.towerLevel = 1;
        this.color = 'white';
        this.fireRadius = 190;
        this.damage = 100;
        this.cost = 1000;
    };
};

class Projectile {
    constructor({position = {x: 0, y: 0}, enemy}) {
        this.position = position;
        this.velocity = {
            x: 0,
            y: 0
        };
        this.enemy = enemy;
        this.radius = 10;

        //testing start//
        this.chosenBuilding = chosenBuilding;
        //testing stop//
    };

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fill();
    };

    update() {
        this.draw();

        const angle = Math.atan2(
            this.enemy.center.y - this.position.y, 
            this.enemy.center.x - this.position.x
            )

        const power = 10;
        this.velocity.x = Math.cos(angle) * power;
        this.velocity.y = Math.sin(angle) * power;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y
    };
};
