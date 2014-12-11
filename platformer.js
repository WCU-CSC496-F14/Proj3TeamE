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

Q.SPRITE_PLAYER = 1;
Q.SPRITE_COLLECTABLE = 2;
Q.SPRITE_ENEMY = 4;
Q.SPRITE_DOOR = 8;

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
      x: 600,           // You can also set additional properties that can
      y: 600,
      points: [[-32,28],[32,28],[32,-41],[-32,-41]],
      type: Q.SPRITE_PLAYER,
      collisionMask: Q.SPRITE_DEFAULT | Q.SPRITE_DOOR | Q.SPRITE_COLLECTABLE,
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
    /*this.on("hit.sprite",function(collision) {

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
        Q.audio.play('coin.mp3');
	  }
    });*/
   
	this.on("jump");
    this.on("jumped");
    this.on("enemy.hit","enemyHit");

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
    Q.state.set("health", 99);
    Q.stageScene('hud', 3, this.p);
  },
  
  step: function(dt) {
  	Q.state.set("x", this.p.x);
  	Q.state.set("y", this.p.y);
  	Q.stageScene('hud', 3, this.p);
    /*var processed = false;
      
    if(!processed) { 
	
      this.p.gravity = 1;

        if(this.p.vx > 0) {
            this.play("walk_right", 1);
          	this.p.direction = "right";
        } else if(this.p.vx < 0) {
            this.play("walk_left", 1);
          	this.p.direction = "left";
        } else if (this.p.vy==0 && this.p.vx==0){
          this.play("stand_" + this.p.direction, 1);
        }
		//add jump reference here?
    }*/
    
    var processed = false;
      
    if(!processed) { 
      this.p.gravity = 1;

        if(this.p.vx > 0) {
        	if (this.p.landed > 0) {
            	this.play("walk_right", 1);
            }
            else {
            	this.play("jump_right", 1);
            }
          	this.p.direction = "right";
        } else if(this.p.vx < 0) {
            if (this.p.landed > 0) {
            	this.play("walk_left", 1);
            }
            else {
            	this.play("jump_left", 1);
            }
          	this.p.direction = "left";
        } else {
          if (this.p.landed > 0) {
            	this.play("stand_" + this.p.direction, 1);
            }
            else {
            	this.play("jump_" + this.p.direction, 1);
            }	
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
  },
  
  enemyHit: function(data) {
    var col = data.col;
    var enemy = data.enemy;
    this.p.vy = -150;
    if (col.normalX == 1) {
      // Hit from left.
      this.p.x -=15;
      this.p.y -=15;
    }
    else {
      // Hit from right;
      this.p.x +=15;
      this.p.y -=15;
    }
    this.p.immune = true;
    this.p.immuneTimer = 0;
    this.p.immuneOpacity = 1;
    this.p.strength -= 25;
    Q.stageScene('hud', 3, this.p);
    if (this.p.strength == 0) {
      this.resetLevel();
    }
  },

});


// ## Tower Sprite
// Sprites can be simple, the Tower sprite just sets a custom sprite sheet
Q.Sprite.extend("Portal", {
  init: function(p) {
    this._super(p, { sheet: 'portal', sprite: 'portal', scale: "0.5", type: Q.SPRITE_DOOR, collisionMask: Q.SPRITE_NONE, sensor: true, });
	this.add('animation');
	this.play("spinning_portal", 1);
	this.on("sensor");
  },
  sensor: function(colObj) {
    // Mark the door object on the player.
    colObj.p.door = this;
  }
});

Q.Sprite.extend("Coins", {
  init: function(p) {
    this._super(p, { sheet: 'coins', sprite: 'coins', scale: "0.5", sensor: true, type: Q.SPRITE_COLLECTABLE, collisionMask: Q.SPRITE_PLAYER, });
	this.add('animation');
	this.play("spin_forever", 1);
	this.on("sensor");
  },
  sensor: function(colObj) {
    // Increment the score.
	Q.state.inc('score', 25);
    Q.stageScene('hud', 3, colObj.p);
    Q.audio.play('coin.mp3');
    this.destroy();
  }
});

Q.Sprite.extend("Spike", {
  init: function(p) {
    this._super(p, { sheet: 'spike', sprite: 'spike', scale: "0.6",type: Q.SPRITE_ENEMY, collisionMask: Q.SPRITE_DEFAULT });
	  this.add('2d');
    this.on("hit.sprite",this,"hit");
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

  },
  
  hit: function(col) {
    if(col.obj.isA("Player") && !col.obj.p.immune && !this.p.dead) {
      col.obj.trigger('enemy.hit', {"enemy":this,"col":col});
      Q.audio.play('hit.mp3');
    }
  },

  die: function(col) {
    if(col.obj.isA("Player")) {
      Q.audio.play('coin.mp3');
      this.p.vx=this.p.vy=0;
      this.play('dead');
      this.p.dead = true;
      var that = this;
      col.obj.p.vy = -300;
      this.p.deadTimer = 0;
    }
  }
});

Q.Sprite.extend("Spikes", {
  init: function(p) {
    this._super(p, { sheet: 'spikes', sprite: 'spikes', points: [[-32,15],[32,15],[32,-49],[-32,-49]], scale: "0.5", type: Q.SPRITE_ENEMY, collisionMask: Q.SPRITE_DEFAULT });
	this.add('2d');
    this.on("hit.sprite",this,"hit");
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
  },
  hit: function(col) {
    if(col.obj.isA("Player") && !col.obj.p.immune && !this.p.dead) {
      col.obj.trigger('enemy.hit', {"enemy":this,"col":col});
      Q.audio.play('hit.mp3');
    }
  },

  die: function(col) {
    if(col.obj.isA("Player")) {
      Q.audio.play('coin.mp3');
      this.p.vx=this.p.vy=0;
      this.play('dead');
      this.p.dead = true;
      var that = this;
      col.obj.p.vy = -300;
      this.p.deadTimer = 0;
    }
  }
});

Q.Sprite.extend("Stump",{
  init: function(p) {
    this._super(p, { sheet: 'stump', sprite: 'stump', vx: 70, frames: 0, points: [[-32,4],[32,4],[32,-60],[-32,-60]], scale: "0.9", points: [[-23,14],[23,14],[23,-16],[-23,-16]],
    				type: Q.SPRITE_ENEMY, collisionMask: Q.SPRITE_DEFAULT});

    // Enemies use the Bounce AI to change direction 
    // whenver they run into something.
    this.add('2d, aiBounce, animation');

	this.on("bump.top",this,"die");
    this.on("hit.sprite",this,"hit");
    
    // Listen for a sprite collision, if it's the player,
    // end the game unless the enemy is hit on top
    this.on("bump.left,bump.right,bump.bottom",function(collision) {
      if(collision.obj.isA("Player")) { 
      	Q.state.dec("health", 33);
      	if (Q.state.get("health") == 0)
      	{
      		Q.state.dec("lives", 1);
      		collision.obj.destroy();
      		if (Q.state.get("lives") == 0 || Q.state.get("lives") < 0) {
				Q.stageScene("endGame",1, { label: "Game Over!", text: "Play Again" });
			}
			else {
				Q.stageScene("endGame",1, { label: "You Died", text: "Respawn" });
			}
      	}
      	
      	Q.audio.play('hit.mp3');
      	Q.stageScene('hud', 3, collision.obj.p);
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
    hit: function(col) {
    if(col.obj.isA("Player") && !col.obj.p.immune && !this.p.dead) {
      col.obj.trigger('enemy.hit', {"enemy":this,"col":col});
      Q.audio.play('hit.mp3');
    }
  },

  die: function(col) {
    if(col.obj.isA("Player")) {
      Q.audio.play('coin.mp3');
      this.p.vx=this.p.vy=0;
      this.play('dead');
      this.p.dead = true;
      var that = this;
      col.obj.p.vy = -300;
      this.p.deadTimer = 0;
    }
  }
	
});

Q.Sprite.extend("Wolf",{
  init: function(p) {
    this._super(p, { sheet: 'wolf', sprite: 'wolf', vx: 70, frames: 0, scale: "0.7", points: [[-32,10],[32,10],[32,-35],[-32,-35]],
    				type: Q.SPRITE_ENEMY, collisionMask: Q.SPRITE_DEFAULT});

    // Enemies use the Bounce AI to change direction 
    // whenver they run into something.
    this.add('2d, aiBounce, animation');

	this.on("bump.top",this,"die");
    this.on("hit.sprite",this,"hit");
    
    // Listen for a sprite collision, if it's the player,
    // end the game unless the enemy is hit on top
    this.on("bump.left,bump.right,bump.bottom",function(collision) {
      if(collision.obj.isA("Player")) { 
      	Q.state.dec("health", 33);
      	if (Q.state.get("health") == 0)
      	{
      		Q.state.dec("lives", 1);
      		collision.obj.destroy();
      		if (Q.state.get("lives") == 0 || Q.state.get("lives") < 0) {
				Q.stageScene("endGame",1, { label: "Game Over!", text: "Play Again" });
			}
			else {
				Q.stageScene("endGame",1, { label: "You Died", text: "Respawn" });
			}
      	}
      	
      	Q.audio.play('hit.mp3');
      	Q.stageScene('hud', 3, collision.obj.p);
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
    hit: function(col) {
    if(col.obj.isA("Player") && !col.obj.p.immune && !this.p.dead) {
      col.obj.trigger('enemy.hit', {"enemy":this,"col":col});
      Q.audio.play('hit.mp3');
    }
  },

  die: function(col) {
    if(col.obj.isA("Player")) {
      Q.audio.play('coin.mp3');
      this.p.vx=this.p.vy=0;
      this.play('dead');
      this.p.dead = true;
      var that = this;
      col.obj.p.vy = -300;
      this.p.deadTimer = 0;
    }
  }
});
	
	Q.Sprite.extend("Snailblue",{
  init: function(p) {
    this._super(p, { sheet: 'snailblue', sprite: 'snailblue', vx: 60, frames: 0, points: [[-32,5],[32,5],[32,-45],[-32,-45]],
    				type: Q.SPRITE_ENEMY, collisionMask: Q.SPRITE_DEFAULT});

    // Enemies use the Bounce AI to change direction 
    // whenver they run into something.
    this.add('2d, aiBounce, animation');

	this.on("bump.top",this,"die");
    this.on("hit.sprite",this,"hit");

    // Listen for a sprite collision, if it's the player,
    // end the game unless the enemy is hit on top
    this.on("bump.left,bump.right,bump.bottom",function(collision) {
      if(collision.obj.isA("Player")) { 
      	Q.state.dec("health", 33);
      	if (Q.state.get("health") == 0)
      	{
      		Q.state.dec("lives", 1);
      		collision.obj.destroy();
      		if (Q.state.get("lives") == 0 || Q.state.get("lives") < 0) {
				Q.stageScene("endGame",1, { label: "Game Over!", text: "Play Again" });
			}
			else {
				Q.stageScene("endGame",1, { label: "You Died", text: "Respawn" });
			}
      	}
      	
      	Q.audio.play('hit.mp3');
      	Q.stageScene('hud', 3, collision.obj.p);
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
    hit: function(col) {
    if(col.obj.isA("Player") && !col.obj.p.immune && !this.p.dead) {
      col.obj.trigger('enemy.hit', {"enemy":this,"col":col});
      Q.audio.play('hit.mp3');
    }
  },

  die: function(col) {
    if(col.obj.isA("Player")) {
      Q.audio.play('coin.mp3');
      this.p.vx=this.p.vy=0;
      this.play('dead');
      this.p.dead = true;
      var that = this;
      col.obj.p.vy = -300;
      this.p.deadTimer = 0;
    }
  }
	});
	
  Q.Sprite.extend("Logo", {
  init: function(p) {
    this._super(p, { asset: 'titlelogo.png' });
  },
});

Q.Sprite.extend("Factory", {
  init: function(p) {
    this._super(p, { asset: 'factory.png' });
    this.on("bump.left,bump.right,bump.bottom",function(collision) {
      if(collision.obj.isA("Player")) { 
      	Q.clearStages();
    	Q.stageScene('winGame');
      }
    });
  },
});

Q.Sprite.extend("Instructions", {
  init: function(p) {
    this._super(p, {});
  },
  step: function(dt){
  	if(Q.inputs['up']) {
  		Q.clearStages();
    	Q.stageScene('level1');
    	Q.state.reset({ score: 0, lives: 3, level: 1, health: 99 });
    	Q.stageScene('hud', 3, Q('Player').first().p);
  	}
  }
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
 stage.insert(new Q.Wolf({ x: 1100, y: 600 }));
  stage.insert(new Q.Snailblue({ x: 1300, y: 500 }));
  stage.insert(new Q.Stump({ x: 1600, y: 500 }));
  stage.insert(new Q.Snailblue({ x: 1800, y: 500 }));
  stage.insert(new Q.Wolf({ x: 2000, y: 500 }));
  stage.insert(new Q.Stump({ x: 2600, y: 500 }));
  stage.insert(new Q.Snailblue({ x: 2900, y: 500 }));
  stage.insert(new Q.Snailblue({ x: 4400, y: 200 }));
  stage.insert(new Q.Wolf({ x: 4900, y: 200 }));
  stage.insert(new Q.Stump({ x: 5200, y: 200 }));
  
  stage.insert(new Q.Coins({ x: 750, y:575}));
  stage.insert(new Q.Coins({ x: 850, y:550}));
  stage.insert(new Q.Coins({ x: 1250, y:575}));
  stage.insert(new Q.Coins({ x: 1450, y:575}));
  stage.insert(new Q.Coins({ x: 1650, y:575}));
  stage.insert(new Q.Coins({ x: 1850, y:550}));
  stage.insert(new Q.Coins({ x: 2250, y:550}));
  stage.insert(new Q.Coins({ x: 2650, y:510}));
  stage.insert(new Q.Coins({ x: 3050, y:550}));
  stage.insert(new Q.Coins({ x: 3650, y:375}));
  stage.insert(new Q.Coins({ x: 4650, y:400}));
  stage.insert(new Q.Coins({ x: 5050, y:400}));
  
  stage.insert(new Q.Coins({ x: 700, y:575}));
  stage.insert(new Q.Coins({ x: 800, y:550}));
  stage.insert(new Q.Coins({ x: 1050, y:575}));
  stage.insert(new Q.Coins({ x: 1550, y:550}));
  stage.insert(new Q.Coins({ x: 950, y:575}));
  stage.insert(new Q.Coins({ x: 2050, y:550}));
  stage.insert(new Q.Coins({ x: 2450, y:550}));
  stage.insert(new Q.Coins({ x: 2900, y:510}));
  stage.insert(new Q.Coins({ x: 3400, y:500}));
  stage.insert(new Q.Coins({ x: 3750, y:375}));
  stage.insert(new Q.Coins({ x: 4050, y:375}));
  stage.insert(new Q.Coins({ x: 4250, y:375}));
  stage.insert(new Q.Coins({ x: 5250, y:400}));
  stage.insert(new Q.Coins({ x: 5450, y:400}));
  
  
   //stage.insert(new Q.Spikes({ x: 750, y:620}));
  // Finally add in the tower goal
  //stage.insert(new Q.Tower({ x: 180, y: 50 }));
  stage.insert(new Q.Portal({ x: 5960, y: 450 }));
  
  
  stage.on("complete",function() { 
  	Q.state.inc("level", 1);
    Q.stageScene("level" + Q.state.get("level")); 
    Q.stageScene('hud', 3, this.p);
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
 stage.insert(new Q.Snailblue({ x: 1300, y: 400 }));
  stage.insert(new Q.Wolf({ x: 1600, y: 400 }));
  stage.insert(new Q.Wolf({ x: 1100, y: 500 }));
  stage.insert(new Q.Snailblue({ x: 3600, y: 300 }));
   stage.insert(new Q.Snailblue({ x: 3300, y: 200 }));
  stage.insert(new Q.Wolf({ x: 2000, y: 200 }));
  stage.insert(new Q.Stump({ x: 2400, y: 200 }));
  stage.insert(new Q.Snailblue({ x: 3600, y: 200 }));

  stage.insert(new Q.Snailblue({ x: 1900, y: 300 }));
  stage.insert(new Q.Wolf({ x: 2100, y: 300 }));
  stage.insert(new Q.Stump({ x: 2700, y: 300 }));
  stage.insert(new Q.Snailblue({ x: 3000, y: 300 }));
  stage.insert(new Q.Stump({ x: 4300, y: 200 }));
  stage.insert(new Q.Snailblue({ x: 4500, y: 200 }));
  stage.insert(new Q.Stump({ x: 5000, y: 200 }));
  stage.insert(new Q.Stump({ x: 5600, y: 200 }));
  stage.insert(new Q.Wolf({ x: 5800, y: 200 }));
  
  stage.insert(new Q.Coins({ x: 850, y:500}));
  stage.insert(new Q.Coins({ x: 950, y:500}));
  stage.insert(new Q.Coins({ x: 1350, y:450}));
  stage.insert(new Q.Coins({ x: 1550, y:550}));
  stage.insert(new Q.Coins({ x: 1750, y:450}));
  stage.insert(new Q.Coins({ x: 1950, y:450}));
  stage.insert(new Q.Coins({ x: 2350, y:450}));
  stage.insert(new Q.Coins({ x: 2750, y:400}));
  stage.insert(new Q.Coins({ x: 3150, y:450}));
  stage.insert(new Q.Coins({ x: 3750, y:400}));
  stage.insert(new Q.Coins({ x: 4150, y:400}));
  stage.insert(new Q.Coins({ x: 4350, y:400}));
  stage.insert(new Q.Coins({ x: 4750, y:450}));
  stage.insert(new Q.Coins({ x: 5150, y:450}));
  
  stage.insert(new Q.Coins({ x: 1000, y:450}));
  stage.insert(new Q.Coins({ x: 1050, y:500}));
  stage.insert(new Q.Coins({ x: 1150, y:450}));
  stage.insert(new Q.Coins({ x: 1650, y:550}));
  stage.insert(new Q.Coins({ x: 1850, y:550}));
  stage.insert(new Q.Coins({ x: 2050, y:550}));
  stage.insert(new Q.Coins({ x: 2650, y:550}));
  stage.insert(new Q.Coins({ x: 3350, y:500}));
  stage.insert(new Q.Coins({ x: 5500, y:400}));

  // Finally add in the tower goal
   stage.insert(new Q.Portal({ x: 6050, y: 450 }));
  stage.on("complete",function() { 
  	Q.state.inc("level", 1);
    Q.stageScene("level" + Q.state.get("level")); 
    Q.stageScene('hud', 3, this.p);
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
 stage.insert(new Q.Snailblue({ x: 1300, y: 400 }));
  stage.insert(new Q.Stump({ x: 1600, y: 400 }));
  stage.insert(new Q.Wolf({ x: 1100, y: 500 }));
  stage.insert(new Q.Snailblue({ x: 3600, y: 300 }));
   stage.insert(new Q.Wolf({ x: 3300, y: 200 }));
  stage.insert(new Q.Stump({ x: 2000, y: 200 }));
  stage.insert(new Q.Wolf({ x: 2400, y: 200 }));
  stage.insert(new Q.Snailblue({ x: 3700, y: 200 }));

  stage.insert(new Q.Snailblue({ x: 1900, y: 500 }));
  stage.insert(new Q.Stump({ x: 2100, y: 500 }));
  stage.insert(new Q.Stump({ x: 2700, y: 500 }));
  stage.insert(new Q.Snailblue({ x: 3000, y: 500 }));
  stage.insert(new Q.Wolf({ x: 4100, y: 200 }));
  stage.insert(new Q.Stump({ x: 3700, y: 200 }));
  stage.insert(new Q.Wolf({ x: 4300, y: 200 }));
  stage.insert(new Q.Stump({ x: 3500, y: 200 }));
  stage.insert(new Q.Snailblue({ x: 4500, y: 200 }));
  stage.insert(new Q.Stump({ x: 5000, y: 200 }));
  stage.insert(new Q.Wolf({ x: 5600, y: 200 }));
  stage.insert(new Q.Snailblue({ x: 5800, y: 200 }));
  stage.insert(new Q.Wolf({ x: 5700, y: 200 }));
  
  stage.insert(new Q.Coins({ x: 850, y:450}));
  stage.insert(new Q.Coins({ x: 950, y:500}));
  stage.insert(new Q.Coins({ x: 1350, y:450}));
  stage.insert(new Q.Coins({ x: 1550, y:550}));
  stage.insert(new Q.Coins({ x: 1750, y:550}));
  stage.insert(new Q.Coins({ x: 1950, y:500}));
  stage.insert(new Q.Coins({ x: 2650, y:450}));
  stage.insert(new Q.Coins({ x: 2750, y:450}));
  stage.insert(new Q.Coins({ x: 3150, y:550}));
  stage.insert(new Q.Coins({ x: 3750, y:500}));
  stage.insert(new Q.Coins({ x: 4150, y:500}));
  stage.insert(new Q.Coins({ x: 4350, y:500}));
  stage.insert(new Q.Coins({ x: 4750, y:450}));
  stage.insert(new Q.Coins({ x: 5150, y:450}));
  
  stage.insert(new Q.Coins({ x: 1000, y:450}));
  stage.insert(new Q.Coins({ x: 1050, y:500}));
  stage.insert(new Q.Coins({ x: 1150, y:450}));
  stage.insert(new Q.Coins({ x: 1650, y:550}));
  stage.insert(new Q.Coins({ x: 1850, y:550}));
  stage.insert(new Q.Coins({ x: 2050, y:500}));
  stage.insert(new Q.Coins({ x: 2450, y:450}));
  stage.insert(new Q.Coins({ x: 3350, y:450}));
  stage.insert(new Q.Coins({ x: 5500, y:400}));

  // Finally add in the tower goal
   stage.insert(new Q.Portal({ x: 5950, y: 450 }));
   stage.on("complete",function() { 
  	Q.state.inc("level", 1);
    Q.stageScene("level" + Q.state.get("level")); 
    Q.stageScene('hud', 3, this.p);
  });
 
});

Q.scene("level4",function(stage) {

  // Add in a repeater for a little parallax action
  stage.insert(new Q.Repeater({ asset: "background-wall.png", speedX: 0.5, speedY: 0.5 }));

  // Add in a tile layer, and make it the collision layer
  stage.collisionLayer(new Q.TileLayer({
                             dataAsset: 'level4.json',
                             sheet:     'tiles' }));


  // Create the player and add them to the stage
  var player = stage.insert(new Q.Player());

  // Give the stage a moveable viewport and tell it
  // to follow the player.
  stage.add("viewport").follow(player);
  stage.viewport.scale = 2;
  // Add in a couple of enemies
  stage.insert(new Q.Wolf({ x: 1100, y: 600 }));
  stage.insert(new Q.Snailblue({ x: 1300, y: 600 }));
  stage.insert(new Q.Wolf({ x: 1600, y: 500 }));
  stage.insert(new Q.Wolf({ x: 1800, y: 500 }));
  stage.insert(new Q.Stump({ x: 2000, y: 500 }));
  stage.insert(new Q.Wolf({ x: 2600, y: 500 }));
  stage.insert(new Q.Snailblue({ x: 2900, y: 500 }));
  stage.insert(new Q.Wolf({ x: 4400, y: 200 }));
  stage.insert(new Q.Wolf({ x: 4900, y: 200 }));
  stage.insert(new Q.Stump({ x: 5200, y: 200 }));
  
  stage.insert(new Q.Coins({ x: 750, y:575}));
  stage.insert(new Q.Coins({ x: 850, y:550}));
  stage.insert(new Q.Coins({ x: 1250, y:575}));
  stage.insert(new Q.Coins({ x: 1450, y:575}));
  stage.insert(new Q.Coins({ x: 1650, y:575}));
  stage.insert(new Q.Coins({ x: 1850, y:550}));
  stage.insert(new Q.Coins({ x: 2250, y:550}));
  stage.insert(new Q.Coins({ x: 2650, y:510}));
  stage.insert(new Q.Coins({ x: 3050, y:550}));
  stage.insert(new Q.Coins({ x: 3650, y:375}));
  stage.insert(new Q.Coins({ x: 4650, y:400}));
  stage.insert(new Q.Coins({ x: 5050, y:400}));
  
  stage.insert(new Q.Coins({ x: 700, y:575}));
  stage.insert(new Q.Coins({ x: 800, y:550}));
  stage.insert(new Q.Coins({ x: 1050, y:575}));
  stage.insert(new Q.Coins({ x: 1550, y:550}));
  stage.insert(new Q.Coins({ x: 950, y:575}));
  stage.insert(new Q.Coins({ x: 2050, y:550}));
  stage.insert(new Q.Coins({ x: 2450, y:550}));
  stage.insert(new Q.Coins({ x: 2900, y:510}));
  stage.insert(new Q.Coins({ x: 3400, y:500}));
  stage.insert(new Q.Coins({ x: 3750, y:375}));
  stage.insert(new Q.Coins({ x: 4050, y:375}));
  stage.insert(new Q.Coins({ x: 4250, y:375}));
  stage.insert(new Q.Coins({ x: 5250, y:400}));
  stage.insert(new Q.Coins({ x: 5450, y:400}));
  
  
   //stage.insert(new Q.Spikes({ x: 750, y:620}));
  // Finally add in the tower goal
  //stage.insert(new Q.Tower({ x: 180, y: 50 }));
  stage.insert(new Q.Portal({ x: 5800, y: 450 }));
   stage.on("complete",function() { 
  	Q.stageScene("winGame", 1);
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
    	Q.state.reset({ score: 0, lives: 3, level: 1, health: 99 });
    }
    Q.stageScene('level' + Q.state.get("level"));
    Q.state.set("health", 99);
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
    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0)", border: 0
  }));
  
  var title = container.insert(new Q.Logo());
  
  if(Q.input.keypad.size) {
        var text = container.insert(new Q.Instructions({y: 120, asset: 'titletext2.png'}));
        container.fit(20);
  	stage.add("viewport").follow(container);
  	stage.viewport.scale = .75;
	}
	else {
		var text = container.insert(new Q.Instructions({y: 120, asset: 'titletext1.png'}));
		container.fit(20);
  		stage.add("viewport").follow(container);
  		stage.viewport.scale = 1;
	}
});

Q.scene('winGame',function(stage) {
  // Add in a repeater for a little parallax action
  stage.insert(new Q.Repeater({ asset: "background-wall.png", speedX: 0.5, speedY: 0.5 }));

  var container = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0)", border: 0
  }));
  
  var text = container.insert(new Q.Instructions({asset: 'youwon.png'}));
		container.fit(20);
  		stage.add("viewport").follow(container);
  		stage.viewport.scale = 1;
});

Q.scene('hud',function(stage) {
  var container = stage.insert(new Q.UI.Container({
    x: 50, y: 0
  }));
  
  var pointsLength = 4;
  var healthLength = 2;
  
  var score = Q.state.get("score");
  
  var txt = "" + score;
  var i = pointsLength - txt.length, zeros = "";
  while(i-- > 0) { zeros += "0"; }
  
  txt = zeros + txt;
  
  var healthlevel = Q.state.get("health");
  var txt2 = "" + healthlevel;
  var i2 = healthLength - txt2.length, zeros2 = "";
  while(i2-- > 0) { zeros2 += "0"; }
  
  txt2 = zeros2 + txt2;
  
  var label = container.insert(new Q.UI.Text({x:72, y:20,
    label: "Score: " + txt, color: "white" }));
    
  var level = container.insert(new Q.UI.Text({x:50, y: 45,
    label: "Level: " + Q.state.get("level"), color: "white" }));

  var strength = container.insert(new Q.UI.Text({x:50, y: 70,
    label: "Lives: " + Q.state.get("lives"), color: "white" }));
    
  var health = container.insert(new Q.UI.Text({x:62, y: 95,
    label: "Health: " + txt2, color: "white" }));
    
    var x = container.insert(new Q.UI.Text({x:110, y: 110,
    label: "x: " + Q.state.get("x"), color: "white" }));
    
    var y = container.insert(new Q.UI.Text({x:110, y: 135,
    label: "y: " + Q.state.get("y"), color: "white" }));

  container.fit(20);
});

// ## Asset Loading and Game Launch
// Q.load can be called at any time to load additional assets
// assets that are already loaded will be skipped
// The callback will be triggered when everything is loaded

Q.load("spritesheet2.json, spritesheet2.png, level1.json, level2.json, level3.json, level4.json, titlelogo.png, titletext1.png, titletext2.png, youwon.png, land.png, background-wall.png, soundloop.mp3, killenemy.mp3, jump.mp3, hit.mp3, coin.mp3",  function() {

  // Sprites sheets can be created manually
  Q.sheet("tiles","land.png", { tilew: 32, tileh: 32});
  // Or from a .json asset that defines sprite locations
  Q.compileSheets("spritesheet2.png", "spritesheet2.json");
  Q.animations('player', {
      walk_right: { frames: [0,1,2,3,4,5,6,7], rate: 1/6, flip: false, loop: true },
      walk_left: { frames:  [0,1,2,3,4,5,6,7], rate: 1/6, flip: "x", loop: true },
      jump_right: { frames: [9], rate: 1/1, flip: false },
      jump_left: { frames:  [9], rate: 1/1, flip: "x" },
      fall_right: { frames:  [15], rate: 1/1, flip: false },
      fall_left: { frames:  [15], rate: 1/1, flip: "x" },
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
  
  Q.state.reset({ score: 0, lives: 3, level: 1, health: 99, x: 0, y: 0 });
  
  // Finally, call stageScene to run the game
  Q.stageScene("title",1, { label: 'Rainbow Unicorn Sunshine' }); 
  Q.audio.play('soundloop.mp3',{ loop: true });
});
});
