var directions = {
    west: { offset: 0, x: -2, y: 0, opposite: 'east' },
    northWest: { offset: 32, x: -2, y: -1, opposite: 'southEast' },
    north: { offset: 64, x: 0, y: -2, opposite: 'south' },
    northEast: { offset: 96, x: 2, y: -1, opposite: 'southWest' },
    east: { offset: 128, x: 2, y: 0, opposite: 'west' },
    southEast: { offset: 160, x: 2, y: 1, opposite: 'northWest' },
    south: { offset: 192, x: 0, y: 2, opposite: 'north' },
    southWest: { offset: 224, x: -2, y: 1, opposite: 'northEast' }
};

var anims = {
    idle:  {startFrame: 0, endFrame: 4,  speed: 0.2  },
    walk:  {startFrame: 4, endFrame: 12, speed: 0.15 },
    attack:{startFrame: 12,endFrame: 20, speed: 0.11 },
    die:   {startFrame: 20,endFrame: 28, speed: 0.2  },
    shoot: {startFrame: 28,endFrame: 32, speed: 0.1  }
};

var cursors;
var agente;
var pivot;
var tileWidthHalf;
var tileHeightHalf;
var data;
var polygon;
var a = 0;

var d = 0;

var scene;

// GameObject Skeleton
class Skeleton extends Phaser.GameObjects.Image {
    constructor(scene, x, y, motion, direction, distance) {
        super(scene, x, y, 'skeleton', direction.offset);

        this.startX = x;
        this.startY = y;
        this.distance = distance;
        this.pivot = [0,24];

        this.motion = motion;
        this.anim = anims[motion];
        this.direction = directions[direction];
        //this.speed = 0.15;
        this.speed = 2;
        this.f = this.anim.startFrame;

        this.depth = y + 64;

        scene.time.delayedCall(this.anim.speed * 1000, this.changeFrame, [], this);
    }
    changeState(motion, direction) 
    {
        this.direction = directions[direction];
        this.motion = motion;
        this.anim = anims[motion];
        this.f = this.anim.startFrame;
    }

    changeFrame ()
    {
        this.f++;

        var delay = this.anim.speed;

        if (this.f === this.anim.endFrame)
        {
            switch (this.motion)
            {
                case 'walk':
                    this.f = this.anim.startFrame;
                    this.frame = this.texture.get(this.direction.offset + this.f);
                    scene.time.delayedCall(delay * 1000, this.changeFrame, [], this);
                    break;

                case 'attack':
                    delay = Math.random() * 2;
                    scene.time.delayedCall(delay * 1000, this.resetAnimation, [], this);
                    break;

                case 'idle':
                    delay = 0.5 + Math.random();
                    scene.time.delayedCall(delay * 1000, this.resetAnimation, [], this);
                    break;

                case 'die':
                    delay = 6 + Math.random() * 6;
                    scene.time.delayedCall(delay * 1000, this.resetAnimation, [], this);
                    break;
            }
        }
        else
        {
            this.frame = this.texture.get(this.direction.offset + this.f);

            scene.time.delayedCall(delay * 1000, this.changeFrame, [], this);
        }
    }

    resetAnimation ()
    {
        this.f = this.anim.startFrame;

        this.frame = this.texture.get(this.direction.offset + this.f);

        scene.time.delayedCall(this.anim.speed * 1000, this.changeFrame, [], this);
    }

    update ()
    {
        if (this.motion === 'walk')
        {
            this.x += this.direction.x * this.speed;

            if (this.direction.y !== 0)
            {
                this.y += this.direction.y * this.speed;
                this.depth = this.y + 64;
            }

      
            while(!Phaser.Geom.Polygon.Contains(polygon, this.x+this.pivot[0], this.y+this.pivot[1])){
                this.x -= this.direction.x * this.speed;

                if (this.direction.y !== 0)
                {
                    this.y -= this.direction.y * this.speed;
                    this.depth = this.y + 64;
                }
            }
        }
    }
}

class Example extends Phaser.Scene
{
    constructor ()
    {
        super();
    }

    preload ()
    {
        this.load.json('map', './isometric-grass-and-water.json');
        this.load.spritesheet('tiles', './isometric-grass-and-water.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('skeleton', './skeleton8.png', { frameWidth: 128, frameHeight: 128 });
        this.load.image('house', './rem_0002.png');
    }

    create ()
    {
        scene = this;
        cursors = this.input.keyboard.createCursorKeys();

        polygon = new Phaser.Geom.Polygon([
            0,400,
            800,0,
            1600,400,
            800,800,
            0,400
        ]);

        this.buildMap();
        this.placeHouses();

        agente = this.add.existing(new Skeleton(this, 800, 150, 'walk', 'south', 600));
        
        this.cameras.main.setSize(1600, 600);
    }

    update ()
    {
        if (cursors.right.isDown) {
           agente.changeState('walk', 'east') 
        } else if (cursors.left.isDown) {
            agente.changeState('walk', 'west') 
        } else if (cursors.up.isDown) {
            agente.changeState('walk', 'north') 
        } else if (cursors.down.isDown) {
            agente.changeState('walk', 'south') 
        }

        agente.update();

        this.cameras.main.centerOn(agente.x+400, agente.y-150);
    }


    buildMap ()
    {
        //  Parse the data out of the map
        data = scene.cache.json.get('map');

        const tilewidth = data.tilewidth;
        const tileheight = data.tileheight;

        tileWidthHalf = tilewidth / 2;
        tileHeightHalf = tileheight / 2;

        const layer = data.layers[0].data;

        const mapwidth = data.layers[0].width;
        const mapheight = data.layers[0].height;

        const centerX = mapwidth * tileWidthHalf;
        const centerY = 16;

        let i = 0;

        for (let y = 0; y < mapheight; y++)
        {
            for (let x = 0; x < mapwidth; x++)
            {
                const id = layer[i] - 1;

                const tx = (x - y) * tileWidthHalf;
                const ty = (x + y) * tileHeightHalf;

                const tile = scene.add.image(centerX + tx, centerY + ty, 'tiles', id);

                tile.depth = centerY + ty;
                
                i++;
            }
        }
    }

    placeHouses ()
    {
        const house_1 = scene.add.image(240, 370, 'house');
        house_1.depth = house_1.y + 86;

        const house_2 = scene.add.image(1300, 290, 'house');
        house_2.depth = house_2.y + 86;
    }
}

const config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    backgroundColor: '#ababab',
    parent: 'phaser-example',
    scene: [ Example ]
};

const game = new Phaser.Game(config);
