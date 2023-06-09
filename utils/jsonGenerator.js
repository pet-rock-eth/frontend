const fs = require('fs');
let stories = fs.readFileSync('./story.csv', 'utf8');
stories = stories.split('\n');
stories.shift();
stories = stories.map((story, i) => {
  story = story.split(',');
  let res = {
    id: story[0],
    name: story[1],
    description: story[2].replace(/\r/g, ''),
    image: `https://pet-rock-eth.pancake.tw/nft/${story[0]}.png`,
  }
  fs.writeFileSync(`../public/nft/${story[0]}.json`, JSON.stringify(res));
});
