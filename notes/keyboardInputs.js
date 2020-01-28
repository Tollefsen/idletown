// How to add keys to keyboard eventhandler and check if pressed

let cursors;
let wasd;

function create() {
  // ...
  // cursors = { up: Key, right: Key, left: Key, down: Key, space: Key, shift: Key}
  cursors = this.input.keyboard.createCursorKeys();
  // Add custom keys
  wasd = {
    left: this.input.keyboard.addKey("a"),
    right: this.input.keyboard.addKey("d"),
    down: this.input.keyboard.addKey("s"),
    up: this.input.keyboard.addKey("w")
  };
}

function update() {
  // ..
  if (cursors.left.isDown || wasd.left.isDown) {
    player.body.setVelocityX(-speed);
  }
  if (cursors.left.isDown || wasd.left.isDown) {
    player.anims.play("misa-left-walk", true);
  }
}
