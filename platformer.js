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
      x: 200,           // You can also set additional properties that can
      y: 600,
      points: [[-32,23],[32,23],[32,-41],[-32,-41]],
	  scale: "0.8",
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
      if(collision.obj.isA("Portal")) {
        //Q.stageScene("endGame",1, { label: "You Won!" }); 
        //this.destroy();
		this.stage.trigger("complete");
      }
	  if(collision.obj.isA("Coins")) {
	     collision.obj.destroy();
        Q.state.inc('score', 25);
        Q.stageScene('hud', 3, collision.obj.p);
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
			Q.stageScene("endGame",1, { label: "Game Over!", text: "Play Again" });
		}
		else {
			this.resetLevel();
		}
	}
  }

});


// ## Tower Sprite
// Sprites can be simple, the Tower sprite just sets a custom sprite sheet
Q.Sprite.extend("Portal", {
  init: function(p) {
    this._super(p, { sheet: 'portal', sprite: 'portal', scale: "0.5" });
	this.add('animation');
	this.play("spinning_portal", 1);
  }
});

Q.Sprite.extend("Coins", {
  init: function(p) {
    this._super(p, { sheet: 'coins', sprite: 'coins', scale: "0.5" });
	this.add('animation');
	this.play("spin_forever", 1);
  }
});

Q.Sprite.extend("Spike", {
  init: function(p) {
    this._super(p, { sheet: 'spike', sprite: 'spike', scale: "0.6" });
	  this.add('2d');
	  this.on("bump.left,bump.right,bump.bottom,bump.top",function(collision) {
      if(collision.obj.isA("Player")) { 
      	Q.state.dec("lives", 1);
      	Q.audio.play('hit.mp3');
      	Q.stageScene('hud', 3, collision.obj.p);
      	if (Q.state.get("lives") == 0 || Q.state.get("lives") < 0) {
    		collision.obj.destroy();
			Q.stageScene("endGame",1, { label: "Game Over!", text: "Play Again" });
		}
		else {
			collision.obj.destroy();
			Q.stageScene("endGame",1, { label: "You Died", text: "Respawn" });
		}
      }
    });

  }
});

Q.Sprite.extend("Spikes", {
  init: function(p) {
    this._super(p, { sheet: 'spikes', sprite: 'spikes', scale: "0.5" });
	this.add('2d');
	  this.on("bump.left,bump.right,bump.bottom,bump.top",function(collision) {
      if(collision.obj.isA("Player")) { 
      	Q.state.dec("lives", 1);
      	Q.audio.play('hit.mp3');
      	Q.stageScene('hud', 3, collision.obj.p);
      	if (Q.state.get("lives") == 0 || Q.state.get("lives") < 0) {
    		collision.obj.destroy();
			Q.stageScene("endGame",1, { label: "Game Over!", text: "Play Again" });
		}
		else {
			collision.obj.destroy();
			Q.stageScene("endGame",1, { label: "You Died", text: "Respawn" });
		}
      }
    });
  }
});

Q.Sprite.extend("Stump",{
  init: function(p) {
    this._super(p, { sheet: 'stump', sprite: 'stump', vx: 70, frames: 0, scale: "0.9", points: [[-23,14],[23,14],[23,-16],[-23,-16]],});

    // Enemies use the Bounce AI to change direction 
    // whenver they run into something.
    this.add('2d, aiBounce, animation');

    // Listen for a sprite collision, if it's the player,
    // end the game unless the enemy is hit on top
    this.on("bump.left,bump.right,bump.bottom",function(collision) {
      if(collision.obj.isA("Player")) { 
      	Q.state.dec("lives", 1);
      	Q.audio.play('hit.mp3');
      	Q.stageScene('hud', 3, collision.obj.p);
      	if (Q.state.get("lives") == 0 || Q.state.get("lives") < 0) {
    		collision.obj.destroy();
			Q.stageScene("endGame",1, { label: "Game Over!", text: "Play Again" });
		}
		else {
			collision.obj.destroy();
			Q.stageScene("endGame",1, { label: "You Died", text: "Respawn" });
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
	},
	
	step: function(dt) {
        if(this.p.vx > 0) {
          this.play("walk_right", 1);
        } else if(this.p.vx < 0) {
          this.play("walk_left", 1);
        }
    },
	
});

Q.Sprite.extend("Wolf",{
  init: function(p) {
    this._super(p, { sheet: 'wolf', sprite: 'wolf', vx: 70, frames: 0, scale: "0.7", points: [[-32,18],[32,18],[32,-24],[-32,-24]],});

    // Enemies use the Bounce AI to change direction 
    // whenver they run into something.
    this.add('2d, aiBounce, animation');

    // Listen for a sprite collision, if it's the player,
    // end the game unless the enemy is hit on top
    this.on("bump.left,bump.right,bump.bottom",function(collision) {
      if(collision.obj.isA("Player")) { 
      	Q.state.dec("lives", 1);
      	Q.audio.play('hit.mp3');
      	Q.stageScene('hud', 3, collision.obj.p);
      	if (Q.state.get("lives") == 0 || Q.state.get("lives") < 0) {
    		collision.obj.destroy();
			Q.stageScene("endGame",1, { label: "Game Over!", text: "Play Again" });
		}
		else {
			collision.obj.destroy();
			Q.stageScene("endGame",1, { label: "You Died", text: "Respawn" });
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
	},
	
	step: function(dt) {
        if(this.p.vx > 0) {
          this.play("walk_right", 1);
        } else if(this.p.vx < 0) {
          this.play("walk_left", 1);
        }
    },
});
	
	Q.Sprite.extend("Snailblue",{
  init: function(p) {
    this._super(p, { sheet: 'snailblue', sprite: 'snailblue', vx: 60, frames: 0, points: [[-15,10],[15,10],[15,-12],[-15,-12]],});

    // Enemies use the Bounce AI to change direction 
    // whenver they run into something.
    this.add('2d, aiBounce, animation');

    // Listen for a sprite collision, if it's the player,
    // end the game unless the enemy is hit on top
    this.on("bump.left,bump.right,bump.bottom",function(collision) {
      if(collision.obj.isA("Player")) { 
      	Q.state.dec("lives", 1);
      	Q.audio.play('hit.mp3');
      	Q.stageScene('hud', 3, collision.obj.p);
      	if (Q.state.get("lives") == 0 || Q.state.get("lives") < 0) {
    		collision.obj.destroy();
			Q.stageScene("endGame",1, { label: "Game Over!", text: "Play Again" });
		}
		else {
			collision.obj.destroy();
			Q.stageScene("endGame",1, { label: "You Died", text: "Respawn" });
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
        Q.state.inc('score', 50);
        Q.stageScene('hud', 3, collision.obj.p);
      }
    });
  },
	  destroyed: function() {
	},
	
	step: function(dt) {
        if(this.p.vx > 0) {
          this.play("walk_right", 1);
        } else if(this.p.vx < 0) {
          this.play("walk_left", 1);
        }
    },
	});

// ## Level1 scene
// Create a new scene called level 1
Q.scene("level1",function(stage) {

  // Add in a repeater for a little parallax action
  stage.insert(new Q.Repeater({ asset: "background-wall.png", speedX: 0.5, speedY: 0.5 }));

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
  stage.insert(new Q.Wolf({ x: 400, y: 600 }));
  stage.insert(new Q.Stump({ x: 600, y: 500 }));
  stage.insert(new Q.Snailblue({ x: 700, y: 500 }));
  stage.insert(new Q.Stump({ x: 1200, y: 500 }));
  stage.insert(new Q.Snailblue({ x: 1400, y: 500 }));
  stage.insert(new Q.Stump({ x: 1600, y: 500 }));
  stage.insert(new Q.Stump({ x: 2200, y: 500 }));
  stage.insert(new Q.Snailblue({ x: 2500, y: 500 }));
  stage.insert(new Q.Snailblue({ x: 4000, y: 200 }));
  stage.insert(new Q.Stump({ x: 4500, y: 200 }));
  stage.insert(new Q.Stump({ x: 4800, y: 200 }));
  
  stage.insert(new Q.Coins({ x: 350, y:575}));
  stage.insert(new Q.Coins({ x: 450, y:550}));
  stage.insert(new Q.Coins({ x: 850, y:575}));
  stage.insert(new Q.Coins({ x: 1050, y:575}));
  stage.insert(new Q.Coins({ x: 1250, y:575}));
  stage.insert(new Q.Coins({ x: 1450, y:550}));
  stage.insert(new Q.Coins({ x: 1850, y:550}));
  stage.insert(new Q.Coins({ x: 2250, y:510}));
  stage.insert(new Q.Coins({ x: 2650, y:550}));
  stage.insert(new Q.Coins({ x: 3250, y:375}));
  stage.insert(new Q.Coins({ x: 4250, y:400}));
  stage.insert(new Q.Coins({ x: 4650, y:400}));
  
  stage.insert(new Q.Coins({ x: 300, y:575}));
  stage.insert(new Q.Coins({ x: 400, y:550}));
  stage.insert(new Q.Coins({ x: 650, y:575}));
  stage.insert(new Q.Coins({ x: 1150, y:550}));
  stage.insert(new Q.Coins({ x: 550, y:575}));
  stage.insert(new Q.Coins({ x: 1650, y:550}));
  stage.insert(new Q.Coins({ x: 2050, y:550}));
  stage.insert(new Q.Coins({ x: 2500, y:510}));
  stage.insert(new Q.Coins({ x: 3000, y:500}));
  stage.insert(new Q.Coins({ x: 3350, y:375}));
  stage.insert(new Q.Coins({ x: 3650, y:375}));
  stage.insert(new Q.Coins({ x: 3850, y:375}));
  stage.insert(new Q.Coins({ x: 4850, y:400}));
  stage.insert(new Q.Coins({ x: 5050, y:400}));
  
  
   stage.insert(new Q.Spikes({ x: 350, y:600}));
  // Finally add in the tower goal
  //stage.insert(new Q.Tower({ x: 180, y: 50 }));
  stage.insert(new Q.Portal({ x: 5400, y: 450 }));
  
  
  
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
 stage.insert(new Q.Snailblue({ x: 800, y: 400 }));
  stage.insert(new Q.Stump({ x: 1100, y: 400 }));
  stage.insert(new Q.Stump({ x: 600, y: 500 }));
  stage.insert(new Q.Snailblue({ x: 3100, y: 300 }));
   stage.insert(new Q.Snailblue({ x: 2800, y: 200 }));
  stage.insert(new Q.Stump({ x: 1500, y: 200 }));
  stage.insert(new Q.Stump({ x: 1900, y: 200 }));
  stage.insert(new Q.Snailblue({ x: 3200, y: 200 }));

  stage.insert(new Q.Snailblue({ x: 1400, y: 500 }));
  stage.insert(new Q.Stump({ x: 1600, y: 500 }));
  stage.insert(new Q.Stump({ x: 2200, y: 500 }));
  stage.insert(new Q.Snailblue({ x: 2500, y: 500 }));
  stage.insert(new Q.Stump({ x: 3600, y: 200 }));
  stage.insert(new Q.Stump({ x: 3200, y: 200 }));
  stage.insert(new Q.Stump({ x: 3800, y: 200 }));
  stage.insert(new Q.Stump({ x: 3000, y: 200 }));
  stage.insert(new Q.Snailblue({ x: 4000, y: 200 }));
  stage.insert(new Q.Stump({ x: 4500, y: 200 }));
  stage.insert(new Q.Stump({ x: 5100, y: 200 }));
  stage.insert(new Q.Snailblue({ x: 5300, y: 200 }));
  stage.insert(new Q.Snailblue({ x: 5200, y: 200 }));
  
  stage.insert(new Q.Coins({ x: 350, y:500}));
  stage.insert(new Q.Coins({ x: 450, y:500}));
  stage.insert(new Q.Coins({ x: 850, y:450}));
  stage.insert(new Q.Coins({ x: 1050, y:550}));
  stage.insert(new Q.Coins({ x: 1250, y:550}));
  stage.insert(new Q.Coins({ x: 1450, y:550}));
  stage.insert(new Q.Coins({ x: 1850, y:550}));
  stage.insert(new Q.Coins({ x: 2250, y:500}));
  stage.insert(new Q.Coins({ x: 2650, y:550}));
  stage.insert(new Q.Coins({ x: 3250, y:500}));
  stage.insert(new Q.Coins({ x: 3650, y:500}));
  stage.insert(new Q.Coins({ x: 3850, y:500}));
  stage.insert(new Q.Coins({ x: 4250, y:450}));
  stage.insert(new Q.Coins({ x: 4650, y:450}));
  
  stage.insert(new Q.Coins({ x: 500, y:450}));
  stage.insert(new Q.Coins({ x: 550, y:500}));
  stage.insert(new Q.Coins({ x: 650, y:450}));
  stage.insert(new Q.Coins({ x: 1150, y:550}));
  stage.insert(new Q.Coins({ x: 1350, y:550}));
  stage.insert(new Q.Coins({ x: 1550, y:550}));
  stage.insert(new Q.Coins({ x: 1950, y:550}));
  stage.insert(new Q.Coins({ x: 2850, y:500}));
  stage.insert(new Q.Coins({ x: 5000, y:400}));

  // Finally add in the tower goal
   stage.insert(new Q.Portal({ x: 5450, y: 450 }));
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
 stage.insert(new Q.Snailblue({ x: 800, y: 400 }));
  stage.insert(new Q.Stump({ x: 1100, y: 400 }));
  stage.insert(new Q.Stump({ x: 600, y: 500 }));
  stage.insert(new Q.Snailblue({ x: 3100, y: 300 }));
   stage.insert(new Q.Snailblue({ x: 2800, y: 200 }));
  stage.insert(new Q.Stump({ x: 1500, y: 200 }));
  stage.insert(new Q.Stump({ x: 1900, y: 200 }));
  stage.insert(new Q.Snailblue({ x: 3200, y: 200 }));

  stage.insert(new Q.Snailblue({ x: 1400, y: 500 }));
  stage.insert(new Q.Stump({ x: 1600, y: 500 }));
  stage.insert(new Q.Stump({ x: 2200, y: 500 }));
  stage.insert(new Q.Snailblue({ x: 2500, y: 500 }));
  stage.insert(new Q.Stump({ x: 3600, y: 200 }));
  stage.insert(new Q.Stump({ x: 3200, y: 200 }));
  stage.insert(new Q.Stump({ x: 3800, y: 200 }));
  stage.insert(new Q.Stump({ x: 3000, y: 200 }));
  stage.insert(new Q.Snailblue({ x: 4000, y: 200 }));
  stage.insert(new Q.Stump({ x: 4500, y: 200 }));
  stage.insert(new Q.Stump({ x: 5100, y: 200 }));
  stage.insert(new Q.Snailblue({ x: 5300, y: 200 }));
  stage.insert(new Q.Snailblue({ x: 5200, y: 200 }));
  
  stage.insert(new Q.Coins({ x: 350, y:450}));
  stage.insert(new Q.Coins({ x: 450, y:500}));
  stage.insert(new Q.Coins({ x: 850, y:450}));
  stage.insert(new Q.Coins({ x: 1050, y:550}));
  stage.insert(new Q.Coins({ x: 1250, y:550}));
  stage.insert(new Q.Coins({ x: 1450, y:500}));
  stage.insert(new Q.Coins({ x: 1850, y:450}));
  stage.insert(new Q.Coins({ x: 2250, y:450}));
  stage.insert(new Q.Coins({ x: 2650, y:550}));
  stage.insert(new Q.Coins({ x: 3250, y:500}));
  stage.insert(new Q.Coins({ x: 3650, y:500}));
  stage.insert(new Q.Coins({ x: 3850, y:500}));
  stage.insert(new Q.Coins({ x: 4250, y:450}));
  stage.insert(new Q.Coins({ x: 4650, y:450}));
  
  stage.insert(new Q.Coins({ x: 500, y:450}));
  stage.insert(new Q.Coins({ x: 550, y:500}));
  stage.insert(new Q.Coins({ x: 650, y:450}));
  stage.insert(new Q.Coins({ x: 1150, y:550}));
  stage.insert(new Q.Coins({ x: 1350, y:550}));
  stage.insert(new Q.Coins({ x: 1550, y:500}));
  stage.insert(new Q.Coins({ x: 1950, y:450}));
  stage.insert(new Q.Coins({ x: 2850, y:450}));
  stage.insert(new Q.Coins({ x: 5000, y:400}));

  // Finally add in the tower goal
   stage.insert(new Q.Portal({ x: 5450, y: 450 }));
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
                                                  label: stage.options.text }))         
  var label = container.insert(new Q.UI.Text({x:10, y: -20 - button.p.h, 
                                                   label: stage.options.label, color: "white" }));
  // When the button is clicked, clear all the stages
  // and restart the game.
  button.on("click",function() {
    Q.clearStages();
    if (Q.state.get("lives") == 0 || Q.state.get("lives") < 0) {
    	Q.state.reset({ score: 0, lives: 3, level: 1 });
    }
    Q.stageScene('level' + Q.state.get("level"));
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

Q.load("spritesheet2.json, spritesheet2.png, level1.json, level2.json, level3.json, land.png, cavebackground.png, background-wall.png, Rick-astley.mp3, killenemy.mp3, jump.mp3, hit.mp3",  function() {//["Rick-astley.mp3"],

  // Sprites sheets can be created manually
  Q.sheet("tiles","land.png", { tilew: 32, tileh: 32, sy:10 });
  // Or from a .json asset that defines sprite locations
  Q.compileSheets("spritesheet2.png", "spritesheet2.json");
  Q.animations('player', {
      walk_right: { frames: [0,1,2,3,4,5,6,7], rate: 1/6, flip: false, loop: true },
      walk_left: { frames:  [0,1,2,3,4,5,6,7], rate: 1/6, flip: "x", loop: true },
      jump_right: { frames: [16], rate: 1/1, flip: false },
      jump_left: { frames:  [17], rate: 1/1, flip: false },
      fall_right: { frames:  [18], rate: 1/1, flip: false },
      fall_left: { frames:  [19], rate: 1/1, flip: false },
      stand_right: { frames:[8], rate: 1/1, flip: false },
      stand_left: { frames: [8], rate: 1/1, flip: "x" },
  });
  
  Q.animations('coins', {
      spin_forever: { frames: [0,1,2,6,7,8,9], rate: 1/6, flip: false, loop: true },
  });
  
  Q.animations('portal', {
	  spinning_portal: { frames: [0,1,2,3], rate: 1/2, flip: false, loop: true}
  });
  
  Q.animations('wolf', {
  	  walk_left: { frames: [0,1,2], rate: 1/3, flip: false, loop:true},
  	  walk_right: { frames: [0,1,2], rate: 1/3, flip: "x", loop:true},
  });
  
  Q.animations('stump', {
  	  walk_left: { frames: [0,1,2], rate: 1/3, flip: false, loop:true},
  	  walk_right: { frames: [0,1,2], rate: 1/3, flip: "x", loop:true},
  });
  
  Q.animations('snailblue', {
  	  walk_left: { frames: [0], rate: 1, flip: false, loop:true},
  	  walk_right: { frames: [0], rate: 1, flip: "x", loop:true},
  });
  
  Q.state.reset({ score: 0, lives: 3, level: 1 });
  
  // Finally, call stageScene to run the game
  Q.stageScene("title",1, { label: "Super Awesome Platformer" }); 
 // Q.audio.play('Rick-astley.mp3',{ loop: true });
});
});
