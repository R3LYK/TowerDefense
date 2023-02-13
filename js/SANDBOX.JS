window.addEventListener('click', (e) => {
    
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

        for (building of buildings) {
             if (collisionWithPosition(mouse, building)) {
                activeBuilding = building;
                
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
        };

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

canvas.addEventListener('click', function(e){ 

    for(let btn of contextMenuArray){ 
        if (collision(mouse, btn)) {
            btn = btn.buttonName;

            switch(btn){
                case 'first':
                    console.log('first');
                    contextMenuArray = [];
                    break;
                case 'last':
                    console.log('last');
                    contextMenuArray = [];
                    break;
                case 'strong':
                    console.log('strong');
                    contextMenuArray = [];
                    break;
                case 'weak':
                    console.log('weak');
                    contextMenuArray = [];
                    break;
            }
        }
    }
});