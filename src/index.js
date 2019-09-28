import Phaser from "phaser";
import { bomb, dude, platform, sky, star } from "./assets";

// import { collectStar } from "./lib/utils";

/* global Phaser */
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);
let platforms,
  player,
  cursors,
  stars,
  score = 0,
  scoreText,
  gameOver,
  Bombs;

function preload() {
  this.load.image("sky", sky);
  this.load.image("ground", platform);
  this.load.image("star", star);
  this.load.image("bomb", bomb);
  this.load.spritesheet("dude", dude, {
    frameWidth: 32,
    frameHeight: 48
  });
}

function create() {
  // initialisation
  this.add.image(400, 300, "sky");
  cursors = this.input.keyboard.createCursorKeys();

  // Platform code
  platforms = this.physics.add.staticGroup();

  platforms
    .create(400, 568, "ground")
    .setScale(2)
    .refreshBody();
  platforms.create(600, 400, "ground");
  platforms.create(50, 250, "ground");
  platforms.create(750, 220, "ground");

  // Player code
  player = this.physics.add.sprite(100, 450, "dude");

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  player.body.setGravityY(300);

  this.physics.add.collider(player, platforms);

  // Stardust code
  stars = this.physics.add.group({
    key: "star",
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 }
  });
  stars.children.iterate(child => {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });
  this.physics.add.collider(stars, platforms);

  this.physics.add.overlap(player, stars, collectStar, null, this);

  // bombs
  Bombs = this.physics.add.group();
  this.physics.add.collider(Bombs, platforms);
  this.physics.add.collider(player, Bombs, hitBomb, null, this);

  // animations
  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  // Scoring
  scoreText = this.add.text(16, 16, "score: 0", {
    fontSize: "32px",
    fill: "#000"
  });
}

function update() {
  // horizontal
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);
    player.anims.play("turn");
  }

  // vertical
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-470);
  }
}

function collectStar(player, star) {
  star.disableBody(true, true);

  score += 10;
  scoreText.setText(`score: ${score}`);

  if (stars.countActive(true) === 0) {
    stars.children.iterate(child => {
      child.enableBody(true, child.x, 0, true, true);
    });

    let x =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);
    let bomb = Bombs.create(x, 16, "bomb");

    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  }
}

function hitBomb(player, bomb) {
  this.physics.pause();

  player.setTint(0xff0000);
  player.anims.play("turn");

  gameOver = true;
}
