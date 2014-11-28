// # Quintus platformer example
//
// [Run the example](../quintus/examples/platformer/index.html)
// WARNING: this game must be run from a non-file:// url
// as it loads a level json file.
//
// This is the example from the website homepage, it consists
// a simple, non-animated platformer with some enemies and a 
// target for the player.
window.addEventListener("load",function() {

// Set up an instance of the Quintus engine  and include
// the Sprites, Scenes, Input and 2D module. The 2D module
// includes the `TileLayer` class as well as the `2d` componet.

var Q = window.Q = Quintus({ audioSupported: [ 'mp3','ogg' ] })//{audioSupported: ['mp3']}
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, Audio")

        // Maximize this game to whatever the size of the browser is
        .setup({ maximize: true })
        // And turn on default input controls and touch input (for UI)
        .controls().touch().enableSound();//

// ## Player Sprite
// The very basic player sprite, this is just a normal sprite
// using the player sprite sheet with default controls added to it.
Q.Sprite.extend("Player",{

  // the init constructor is called on creation
  init: function(p) {

    // You can call the parent's constructor with this._super(..)
    this._super(p, {
      sprite: "player",
      sheet: "player",  // Setting a sprite sheet sets sprite width and height
      x: 90,           // You can also set additional properties that can
      y: 1000, 
// be overridden on object creation
      direction: "right",
    });

    // Add in pre-made components to get up and running quickly
    // The `2d` component adds in default 2d collision detection
    // and kinetics (velocity, gravity)
    // The `platformerControls` makes the player controllable by the
    // default input actions (left, right to move,  up or action to jump)
    // It also checks to make sure the player is on a horizontal surface before
    // letting them jump.
    this.add('2d, platformerControls, animation');

    // Write event handlers to respond hook into behaviors.
    // hit.sprite is called everytime the player collides with a sprite
    this.on("hit.sprite",function(collision) {

      // Check the collision, if it's the Tower, you win!
	  //changed to if its a tower go to the next level
      if(collision.obj.isA("Door")) {
        //Q.stageScene("endGame",1, { label: "You Won!" }); 
        //this.destroy();
		this.stage.trigger("complete");
      }
    });

	this.on("jump");
    this.on("jumped");

  },
  
  jump: function(obj) {
    // Only play sound once.
    if (!obj.p.playedJump) {
      Q.audio.play('jump.mp3');
      obj.p.playedJump = true;
    }
  },

  jumped: function(obj) {
    obj.p.playedJump = false;
  },
  
   resetLevel: function() {
    Q.stageScene("level" + Q.state.get("level"));
    Q.stageScene('hud', 3, this.p);
  },
  
  step: function(dt) {
    var processed = false;
      
    if(!processed) { 
      this.p.gravity = 1;

        if(this.p.vx > 0) {
            this.play("walk_right", 1);
          	this.p.direction = "right";
        } else if(this.p.vx < 0) {
            this.play("walk_left", 1);
          	this.p.direction = "left";
        } else {
          this.play("stand_" + this.p.direction, 1);
        }
    }
	//for level3, player dies if they fall too far
	if(this.p.y > 1500) {
		Q.state.dec("lives", 1);
		Q.stageScene('hud', 3, this.p);
		if (Q.state.get("lives") <= 0) {
    		this.destroy();
			Q.stageScene("endGame",1, { label: "You Died" });
		}
		else {
			this.resetLevel();
		}
	}
  }

});


// ## Tower Sprite
// Sprites can be simple, the Tower sprite just sets a custom sprite sheet
Q.Sprite.extend("Door", {
  init: function(p) {
    this._super(p, { sheet: 'door', sprite: 'door' });
  }
});

// ## Enemy Sprite
// Create the Enemy class to add in some baddies
Q.Sprite.extend("Enemy",{
  init: function(p) {
    this._super(p, { sheet: 'enemy', vx: 100 });

    // Enemies use the Bounce AI to change direction 
    // whenver they run into something.
    this.add('2d, aiBounce');

    // Listen for a sprite collision, if it's the player,
    // end the game unless the enemy is hit on top
    this.on("bump.left,bump.right,bump.bottom",function(collision) {
      if(collision.obj.isA("Player")) { 
      	Q.state.dec("lives", 1);
      	Q.stageScene('hud', 3, collision.obj.p);
      	if (Q.state.get("lives") == 0) {
    		collision.obj.destroy();
			Q.stageScene("endGame",1, { label: "You Died" });
		}
		else {
			collision.obj.resetLevel();
		}
      }
    });

    // If the enemy gets hit on the top, destroy it
    // and give the user a "hop"
    this.on("bump.top",function(collision) {
      if(collision.obj.isA("Player")) { 
        this.destroy();
        Q.audio.play('killenemy.mp3');
        collision.obj.p.vy = -300;
        Q.state.inc('score', 100);
        Q.stageScene('hud', 3, collision.obj.p);
      }
    });
  },
  
  destroyed: function() {
 }
});

// ## Level1 scene
// Create a new scene called level 1
Q.scene("level1",function(stage) {

  // Add in a repeater for a little parallax action
  stage.insert(new Q.Repeater({ asset: "cavebackground.png", speedX: 0.5, speedY: 0.5 }));

  // Add in a tile layer, and make it the collision layer
  stage.collisionLayer(new Q.TileLayer({
                             dataAsset: 'level1.json',
                             sheet:     'tiles' }));


  // Create the player and add them to the stage
  var player = stage.insert(new Q.Player());

  // Give the stage a moveable viewport and tell it
  // to follow the player.
  stage.add("viewport").follow(player);
  stage.viewport.scale = 2;
  // Add in a couple of enemies
  stage.insert(new Q.Enemy({ x: 500, y: 1000 }));
  stage.insert(new Q.Enemy({ x: 700, y: 1000 }));
  stage.insert(new Q.Enemy({ x: 600, y: 900 }));
  stage.insert(new Q.Enemy({ x: 300, y: 950 }));
  stage.insert(new Q.Enemy({ x: 700, y: 700 }));
  stage.insert(new Q.Enemy({ x: 600, y: 400 }));

  // Finally add in the tower goal
  //stage.insert(new Q.Tower({ x: 180, y: 50 }));
  stage.insert(new Q.Door({ x: 1130, y: 232 }));
  stage.on("complete",function() { 
  	Q.state.inc("level", 1);
    Q.stageScene("level" + Q.state.get("level")); 
  });
  
});

//level2
Q.scene("level2",function(stage) {

  // Add in a repeater for a little parallax action
  stage.insert(new Q.Repeater({ asset: "background-wall.png", speedX: 0.5, speedY: 0.5 }));

  // Add in a tile layer, and make it the collision layer
  stage.collisionLayer(new Q.TileLayer({
                             dataAsset: 'level2.json',
                             sheet:     'tiles' }));


  // Create the player and add them to the stage
  var player = stage.insert(new Q.Player());

  // Give the stage a moveable viewport and tell it
  // to follow the player.
  stage.add("viewport").follow(player);
  stage.viewport.scale = 2;

  // Add in a couple of enemies
  stage.insert(new Q.Enemy({ x: 500, y: 1000 }));
  stage.insert(new Q.Enemy({ x: 700, y: 1000 }));
  stage.insert(new Q.Enemy({ x: 300, y: 750 }));
  stage.insert(new Q.Enemy({ x: 800, y: 1000 }));
  stage.insert(new Q.Enemy({ x: 600, y: 800 }));
  stage.insert(new Q.Enemy({ x: 1100, y: 800 }));
  stage.insert(new Q.Enemy({ x: 1500, y: 620 }));
  stage.insert(new Q.Enemy({ x: 1400, y: 620 }));
  stage.insert(new Q.Enemy({ x: 1700, y: 500 }));
  stage.insert(new Q.Enemy({ x: 800, y: 200 }));
  stage.insert(new Q.Enemy({ x: 900, y: 100 }));
  stage.insert(new Q.Enemy({ x: 1400, y: 420 }));
  stage.insert(new Q.Enemy({ x: 1700, y: 300 }));

  // Finally add in the tower goal
   stage.insert(new Q.Door({ x: 1275, y: 10 }));
  stage.on("complete",function() { 
  	Q.state.inc("level", 1);
    Q.stageScene("level" + Q.state.get("level")); 
  });
});

//level3
Q.scene("level3",function(stage) {

  // Add in a repeater for a little parallax action
  stage.insert(new Q.Repeater({ asset: "background-wall.png", speedX: 0.5, speedY: 0.5 }));

  // Add in a tile layer, and make it the collision layer
  stage.collisionLayer(new Q.TileLayer({
                             dataAsset: 'level3.json',
                             sheet:     'tiles' }));


  // Create the player and add them to the stage
  var player = stage.insert(new Q.Player());

  // Give the stage a moveable viewport and tell it
  // to follow the player.
  stage.add("viewport").follow(player);
  stage.viewport.scale = 2;

  // Add in a couple of enemies
  stage.insert(new Q.Enemy({ x: 500, y: 100 }));
  stage.insert(new Q.Enemy({ x: 700, y: 100 }));
  stage.insert(new Q.Enemy({ x: 800, y: 100 }));
  stage.insert(new Q.Enemy({ x: 300, y: 200 }));
  stage.insert(new Q.Enemy({ x: 900, y: 300 }));
  stage.insert(new Q.Enemy({ x: 600, y: 400 }));

  // Finally add in the tower goal
  stage.insert(new Q.Door({ x: 160, y: 230 }));
  stage.on("complete",function() { 
  	Q.stageScene("endGame",1, { label: "You Won!" });
  });
});


// To display a game over / game won popup box, 
// create a endGame scene that takes in a `label` option
// to control the displayed message.
Q.scene('endGame',function(stage) {
  var container = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
  }));

  var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#FFFFFF",
                                                  label: "Play Again" }))         
  var label = container.insert(new Q.UI.Text({x:10, y: -20 - button.p.h, 
                                                   label: stage.options.label, color: "white" }));
  // When the button is clicked, clear all the stages
  // and restart the game.
  button.on("click",function() {
    Q.clearStages();
    Q.state.reset({ score: 0, lives: 3 });
    Q.stageScene('level1');
    Q.stageScene('hud', 3, Q('Player').first().p);
  });

  // Expand the container to visibily fit it's contents
  // (with a padding of 20 pixels)
  container.fit(20);
});

Q.scene('title',function(stage) {
  // Add in a repeater for a little parallax action
  stage.insert(new Q.Repeater({ asset: "background-wall.png", speedX: 0.5, speedY: 0.5 }));

  var container = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
  }));

  var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#FFFFFF",
                                                  label: "Play" }))         
  var label = container.insert(new Q.UI.Text({x:10, y: -20 - button.p.h, 
                                                   label: stage.options.label, color: "white" }));
  // When the button is clicked, clear all the stages
  // and restart the game.
  button.on("click",function() {
    Q.clearStages();
    Q.stageScene('level1');
    Q.stageScene('hud', 3, Q('Player').first().p);
  });

  // Expand the container to visibily fit it's contents
  // (with a padding of 20 pixels)
  container.fit(20);
  
  stage.add("viewport").follow(container);
  stage.viewport.scale = 2;
});

Q.scene('hud',function(stage) {
  var container = stage.insert(new Q.UI.Container({
    x: 50, y: 0
  }));
  
  var pointsLength = 4;
  
  var score = Q.state.get("score");
  
  var txt = "" + score;
  var i = pointsLength - txt.length, zeros = "";
  while(i-- > 0) { zeros += "0"; }
  
  txt = zeros + txt;
  
  var label = container.insert(new Q.UI.Text({x:72, y: 45,
    label: "Score: " + txt, color: "white" }));

  var strength = container.insert(new Q.UI.Text({x:50, y: 20,
    label: "Lives: " + Q.state.get("lives"), color: "white" }));

  container.fit(20);
});

// ## Asset Loading and Game Launch
// Q.load can be called at any time to load additional assets
// assets that are already loaded will be skipped
// The callback will be triggered when everything is loaded

Q.load("spritesheet.png, spritesheet.json, level1.json, level2.json, level3.json, newtiles.png, cavebackground.png, background-wall.png, Rick-astley.mp3, killenemy.mp3, jump.mp3",  function() {//["Rick-astley.mp3"],

  // Sprites sheets can be created manually
  Q.sheet("tiles","newtiles.png", { tilew: 32, tileh: 32 });
  // Or from a .json asset that defines sprite locations
  Q.compileSheets("spritesheet.png","spritesheet.json");
  Q.animations('player', {
      walk_right: { frames: [0,1,2,3,4,5,6,7], rate: 1/6, flip: false, loop: true },
      walk_left: { frames:  [8,9,10,11,12,13,14,15], rate: 1/6, flip: false, loop: true },
      jump_right: { frames: [16], rate: 1/1, flip: false },
      jump_left: { frames:  [17], rate: 1/1, flip: false },
      fall_right: { frames:  [18], rate: 1/1, flip: false },
      fall_left: { frames:  [19], rate: 1/1, flip: false },
      stand_right: { frames:[2], rate: 1/1, flip: false },
      stand_left: { frames: [10], rate: 1/1, flip: false },
  });
  Q.state.reset({ score: 0, lives: 3, level: 1 });
  
  // Finally, call stageScene to run the game
  Q.stageScene("title",1, { label: "Super Awesome Platformer" }); 
  Q.audio.play('Rick-astley.mp3',{ loop: true });
});
});
