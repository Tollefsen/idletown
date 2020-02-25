import Player from "../objects/player.js";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ active: false, visible: false, key: "Game" });
    this.cursors;
    this.wasd;
    this.player;
    this.enemies = [];
    this.showDebug = false;
    this.hearth;
  }

  preload() {
    this.load.image(
      "tiles",
      "../assets/tilesets/tuxmon-sample-32px-extruded.png"
    );
    this.load.tilemapTiledJSON("map", "../assets/tilemaps/tuxemon-town.json");

    // An atlas is a way to pack multiple images together into one texture. I'm using it to load all
    // the player animations (walking left, walking right, etc.) in one image. For more info see:
    //  https://labs.phaser.io/view.html?src=src/animation/texture%20atlas%20animation.js
    // If you don't use an atlas, you can do the same thing with a spritesheet, see:
    //  https://labs.phaser.io/view.html?src=src/animation/single%20sprite%20sheet.js
    this.load.atlas(
      "atlas",
      "../assets/atlas/atlas.png",
      "../assets/atlas/atlas.json"
    );
    this.load.image("hearth", "../assets/hearth.png");
  }

  create() {
    const map = this.make.tilemap({ key: "map" });

    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const belowLayer = map.createStaticLayer("Below Player", tileset, 0, 0);
    const worldLayer = map.createStaticLayer("World", tileset, 0, 0);
    const aboveLayer = map.createStaticLayer("Above Player", tileset, 0, 0);

    worldLayer.setCollisionByProperty({ collides: true });

    // By default, everything gets depth sorted on the screen in the order we created things. Here, we
    // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
    // Higher depths will sit on top of lower depth objects.
    aboveLayer.setDepth(10);

    // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
    // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
    const spawnPoint = map.findObject(
      "Objects",
      obj => obj.name === "Spawn Point"
    );

    // Create a sprite with physics enabled via the physics system. The image used for the sprite has
    // a bit of whitespace, so I'm using setSize & setOffset to control the size of the player's body.
    this.player = new Player(this, spawnPoint.x, spawnPoint.y);

    // Enemies
    map.findObject("Objects", obj => {
      obj.name === "Enemy" ? this.enemies.push(obj) : null;
      return false;
    });

    this.enemies = this.enemies.map(enemy => {
      return this.physics.add
        .sprite(enemy.x, enemy.y, "atlas", "misa-front")
        .setSize(30, 40)
        .setOffset(0, 24);
    });

    // Watch the player and worldLayer for collisions, for the duration of the scene:
    this.physics.add.collider(this.player.getSprite(), worldLayer);
    this.physics.add.collider(this.enemies[0], worldLayer);

    this.physics.world.setBoundsCollision();
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Create the player's walking animations from the texture atlas. These are stored in the global
    // animation manager so any sprite can access them.

    const camera = this.cameras.main;
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Help text that has a "fixed" position on the screen
    this.add
      .text(16, 16, 'Arrow keys to move\nPress "F" to show hitboxes', {
        font: "18px monospace",
        fill: "#000000",
        padding: { x: 20, y: 10 },
        backgroundColor: "#ffffff"
      })
      .setScrollFactor(0)
      .setDepth(30);

    this.hearth = this.add
      .image(this.sys.scale.width - 64, 20, "hearth")
      .setScrollFactor(0)
      .setDepth(30);

    // Debug graphics
    this.input.keyboard.once("keydown_F", event => {
      // Turn on physics debugging to show player's hitbox
      this.physics.world.createDebugGraphic();

      // Create worldLayer collision graphic above the player, but below the help text
      const graphics = this.add
        .graphics()
        .setAlpha(0.75)
        .setDepth(20);
      worldLayer.renderDebug(graphics, {
        tileColor: null, // Color of non-colliding tiles
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
      });
    });
  }

  update(time, delta) {
    this.player.update();
    this.enemies[0].body.setVelocity(0);

    if (this.physics.world.collide(this.player.getSprite(), this.enemies[0])) {
      this.hearth.setVisible(false);
      console.log("collition");
    }
  }
}
