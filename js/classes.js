//copied to refactoring//

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
        c.fillStyle = this.color;
        c.beginPath();
        c.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
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

        const speed = 5;

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
        this.color = 'brown';

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
        // this.radius = fireRadius;
    };


    draw() {
            c.fillStyle = 'rgba(0, 0, 0, 0.18)';
            c.arc(this.center.x, this.center.y, this.fireRadius, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = this.color;
            c.fillRect(this.position.x, this.position.y, this.width, 64);
            c.beginPath();
    };

    drawRadius() {
        
    };

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
        this.color = 'rgba(6, 0, 192, 0.9)';
        this.fireRadius = 200;
        this.damage = 20;
        this.cost = 80;
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
        this.color = 'rgba(192, 0, 6, 0.9)';
        this.fireRadius = 250;
        this.damage = 10;
        this.cost = 50;
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

        const power = 5;
        this.velocity.x = Math.cos(angle) * power;
        this.velocity.y = Math.sin(angle) * power;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y
    };
};
