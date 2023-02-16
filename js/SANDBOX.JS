for (let i = building.projectiles.length - 1; i >= 0; i--) {
    const projectile = building.projectiles[i];
    projectile.update();

    const xDifference = projectile.enemy.center.x - projectile.position.x;
    const yDifference = projectile.enemy.center.y - projectile.position.y;
    const distance = Math.hypot(xDifference, yDifference);

    if (distance < projectile.enemy.radius + projectile.radius) {
      projectile.enemy.health -= building.damage;
      if (projectile.enemy.health <= 0) {
        //push enemy.isHolding to droppedStocks array
        projectile.enemy.isHolding.position = projectile.enemy.position;
        droppedStocks.push(projectile.enemy.isHolding);
        
        const enemyIndex = enemies.findIndex((enemy) => {
          playerMoney += enemy.money;
          moneyUpdate();
          return projectile.enemy === enemy;
        });

        if (enemyIndex > -1) enemies.splice(enemyIndex, 1);
      }
      building.projectiles.splice(i, 1);
    }
  }