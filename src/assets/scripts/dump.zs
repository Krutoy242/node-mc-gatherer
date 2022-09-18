/*

Export all blocks and their harvest levels

*/

function exportAllBlocks() as void {
  print('##################################################');
  print('#          Harvest tool and level                #');
  for item in game.items {
    if(
      item.id.startsWith("avaritiafurnace:") // Blacklist because crashing otherwise
    ) continue;
    
    var lastMeta = -1 as int; // Remember, -1 is not integer by default
    for sub in item.subItems {
      if (lastMeta == sub.damage) continue;
      lastMeta = sub.damage;
      val block = sub.asBlock();
      if(isNull(block)) continue;

      val def = block.definition;
      val state = def.getStateFromMeta(block.meta);
      val tool = def.getHarvestTool(state);
      val harvLevel = def.getHarvestLevel(state);
      if(tool=="" && harvLevel == -1 as int) continue;
      print("<"~def.id~":"~block.meta~"> = "~def.hardness~":"~tool~":"~harvLevel);
    }
  }
  print('##################################################');
}

// events.onPlayerLoggedIn(function(e as crafttweaker.event.PlayerLoggedInEvent){
//   if(e.player.world.isRemote()) return;
//   exportAllBlocks();
// });

exportAllBlocks();