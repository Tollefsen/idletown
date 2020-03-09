import Explosion from "./explosion";

export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    const anims = scene.anims;
    this.hitEnemy = false;
    this.explosion = [];
    anims.create({
      key: "misa-left-walk",
      frames: anims.generateFrameNames("atlas", {
        prefix: "misa-left-walk.",
        start: 0,
        end: 3,
        zeroPad: 3
      }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: "misa-right-walk",
      frames: anims.generateFrameNames("atlas", {
        prefix: "misa-right-walk.",
        start: 0,
        end: 3,
        zeroPad: 3
      }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: "misa-front-walk",
      frames: anims.generateFrameNames("atlas", {
        prefix: "misa-front-walk.",
        start: 0,
        end: 3,
        zeroPad: 3
      }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: "misa-back-walk",
      frames: anims.generateFrameNames("atlas", {
        prefix: "misa-back-walk.",
        start: 0,
        end: 3,
        zeroPad: 3
      }),
      frameRate: 10,
      repeat: -1
    });

    this.sprite = scene.physics.add
      .sprite(x, y, "atlas", "misa-front")
      .setSize(30, 40)
      .setOffset(0, 24);

    this.sprite.setDepth(5);

    this.sprite.setCollideWorldBounds(true);

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = {
      left: scene.input.keyboard.addKey("a"),
      right: scene.input.keyboard.addKey("d"),
      down: scene.input.keyboard.addKey("s"),
      up: scene.input.keyboard.addKey("w")
    };

    const camera = scene.cameras.main;
    camera.startFollow(this.sprite);
    this.removeExplosion = this.removeExplosion.bind(this);
  }

  getSprite() {
    return this.sprite;
  }

  gotHit() {
    this.hitEnemy = true;
  }

  removeExplosion() {
    this.explosion.shift();
  }

  update() {
    const cursors = this.cursors;
    const wasd = this.wasd;
    const player = this.sprite;
    const speed = 175;
    const prevVelocity = player.body.velocity.clone();

    // Stop any previous movement from the last frame
    player.body.setVelocity(0);
    if (this.hitEnemy) {
      this.hitEnemy = false;
      const knockback = speed * 15;
      const oneOrZero = velocity => (velocity === 0 ? 0 : 1);
      const positiveOrNegative = velocity => (velocity >= 0 ? -1 : 1);
      player.body.setVelocityY(
        oneOrZero(prevVelocity.y) *
          positiveOrNegative(prevVelocity.y) *
          knockback
      );
      player.body.setVelocityX(
        oneOrZero(prevVelocity.x) *
          positiveOrNegative(prevVelocity.x) *
          knockback
      );
    } else {
      // Horizontal movement
      if (cursors.left.isDown || wasd.left.isDown) {
        player.body.setVelocityX(-speed);
      } else if (cursors.right.isDown || wasd.right.isDown) {
        player.body.setVelocityX(speed);
      }

      // Vertical movement
      if (cursors.up.isDown || wasd.up.isDown) {
        player.body.setVelocityY(-speed);
      } else if (cursors.down.isDown || wasd.down.isDown) {
        player.body.setVelocityY(speed);
      }

      if (cursors.space.isDown) {
        this.explosion.push(
          new Explosion(this.scene, player.x, player.y, player.body.velocity)
        );
      }
      if (this.explosion.length > 0) {
        this.explosion.forEach(element => {
          element.update(this.removeExplosion);
        });
      }

      // Normalize and scale the velocity so that player can't move faster along a diagonal
      player.body.velocity
        .normalize()
        .scale(cursors.space.isDown ? speed * 2.5 : speed);

      // Update the animation last and give left/right animations precedence over up/down animations
      if (cursors.left.isDown || wasd.left.isDown) {
        player.anims.play("misa-left-walk", true);
      } else if (cursors.right.isDown || wasd.right.isDown) {
        player.anims.play("misa-right-walk", true);
      } else if (cursors.up.isDown || wasd.up.isDown) {
        player.anims.play("misa-back-walk", true);
      } else if (cursors.down.isDown || wasd.down.isDown) {
        player.anims.play("misa-front-walk", true);
      } else {
        player.anims.stop();

        // If we were moving, pick and idle frame to use
        if (prevVelocity.x < 0) player.setTexture("atlas", "misa-left");
        else if (prevVelocity.x > 0) player.setTexture("atlas", "misa-right");
        else if (prevVelocity.y < 0) player.setTexture("atlas", "misa-back");
        else if (prevVelocity.y > 0) player.setTexture("atlas", "misa-front");
      }
    }
  }
}
