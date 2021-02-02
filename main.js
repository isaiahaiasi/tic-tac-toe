(()=>{"use strict";const e=function(){const e=new Map,t=function(t){return e.has(t)};return{publish:function(n){return t(n)?(console.warn(`Tried to publish ${n} event, but that event already exists!`),!1):(e.set(n,function(e){const t=[],n=function(e){return t.includes(e)};return{getName:function(){return e},addListener:function(r){return n(r)?(console.warn(`tried to add listener ${r} to ${e}, but it was already subscribed!`),!1):(t.push(r),!0)},removeListener:function(r){return n(r)?(console.warn(`tried to unsubscribe ${r} from ${e}, but it isn't subscribed!`),!1):(t.splice(t.indexOf(r),1),!0)},callListeners:function(...n){return t.length<1?(console.warn(`Tried to invoke ${e}, but it did not have any listeners!`),!1):(t.forEach((e=>n?e(...n):e())),!0)}}}(n)),!0)},invoke:function(n,...r){return t(n)?(e.get(n).callListeners(...r),!0):(console.warn(`Tried to invoke nonexistent event ${n}!`),!1)},subscribe:function(n,r){return t(n)?e.get(n).addListener(r):(console.warn(`Tried to subscribe ${r} from nonexistent event ${n}!`),!1)},unsubscribe:function(n,r){return t(n)?e.get(n).removeListener(r):(console.warn(`Tried to unsubscribe ${r} from nonexistent event ${n}!`),!1)},destroyEvent:function(t){return!!e.delete(t)||(console.warn(`tried to destroy nonexistent event ${t}!`),!1)},resetEvents:()=>e.clear()}}(),t=function(e,t){const n={x:e,y:t};return Object.freeze(n),n},n=function(){const e=document.querySelector("main");return{getMain:function(){return e},createFromTemplate:function(e,t){return document.querySelector(e).content.querySelector(t).cloneNode(!0)},assignButton:function(e,t,n){const r=e.querySelector(t);return r.addEventListener("click",n),r},clearView:e=>e?.remove()}}(),r=function(){let r,o,i=[];const u=function(n,r){const o=t(n,r),i=document.createElement("div");function u(){e.invoke("movePlayed",o)}return i.classList.add("tile"),i.addEventListener("click",u),{xy:o,node:i,clearEventListener:function(){i.removeEventListener("click",u)}}};function c(){const e=o.getBoard();i.forEach((t=>{const n=e[t.xy.x][t.xy.y];t.node.textContent=n?n.mark:""}))}function s(){i.forEach((e=>{e.clearEventListener()}))}return{init:function(t){!function(){r=document.createElement("div"),r.classList.add("game-board");for(let e=0;e<3;e++)for(let t=0;t<3;t++)i.push(u(t,e));i.forEach((e=>{r.appendChild(e.node)})),n.getMain().appendChild(r)}(),o=t,e.subscribe("boardUpdated",c),e.subscribe("gameOver",s)},clearView:function(){n.clearView(r),i=[]}}}(),o=function(){let t;return{init:function(){t=n.createFromTemplate("#start-tmpl","#start-menu"),n.assignButton(t,"#btn-start-pvp",(function(){e.invoke("startButtonPressed","pvp")})),n.assignButton(t,"#btn-start-pve",(function(){e.invoke("startButtonPressed","pve")})),document.querySelector("main").appendChild(t)},clearView:()=>n.clearView(t)}}(),i=function(){let t;function r(){e.invoke("restart")}return{init:function(e){t=n.createFromTemplate("#end-tmpl","#end-menu"),e?t.querySelector("a").textContent=e.mark:t.querySelector("p").textContent="It's a tie!",n.assignButton(t,"button",r),document.querySelector("main").appendChild(t)},clearView:()=>n.clearView(t)}}(),u=function(){let t,n,u=[];function c(){e.publish("startButtonPressed"),e.subscribe("startButtonPressed",a),o.init()}function a(i){o.clearView(),e.publish("movePlayed"),e.publish("boardUpdated"),e.publish("gameOver"),e.subscribe("boardUpdated",v),e.subscribe("gameOver",d),s.init(),r.init(s),function(e){u=[],u.push(l("X","human")),"pve"===e?u.push(l("O","ai")):u.push(l("O","human")),t=0,n=0}(i)}function d(t){e.publish("restart"),e.subscribe("restart",f),i.init(t)}function f(){i.clearView(),r.clearView(),e.resetEvents(),c()}function v(r){t=(t+1)%u.length,n++,r||(n>=9?e.invoke("gameOver",null):"ai"===u[t].type&&u[t].takeTurn())}return{init:c,getCurrentPlayer:function(){return u[t]},getPlayers:function(){return u}}}(),c=function(t=[]){let n=0;function r(e,r){return t[e.x]||(t[e.x]=[]),!t[e.x][e.y]&&(t[e.x][e.y]=r,n++,!0)}function o(e){const t=[[[0,0],[1,0],[2,0]],[[0,1],[1,1],[2,1]],[[0,2],[1,2],[2,2]],[[0,0],[0,1],[0,2]],[[1,0],[1,1],[1,2]],[[2,0],[2,1],[2,2]],[[0,0],[1,1],[2,2]],[[0,2],[1,1],[2,0]]];for(const n of t)if(i(n,e))return!0;return!1}function i(e,n){for(const r of e)if(t[r[0]][r[1]]!==n)return!1;return!0}function c(t){const n=u.getCurrentPlayer();let i=!1;r(t,n)?(o(n)&&(e.invoke("gameOver",n),i=!0),e.invoke("boardUpdated",i)):"ai"===n.type&&console.warn(`ai tried to make an illegal move (${t.x},${t.y})`)}return{init:function(){t=[];for(let e=0;e<3;e++)t.push([]);e.subscribe("movePlayed",c)},trySet:r,getBoard:function(){return t},getTurnCount:function(){return n},checkWinner:o,getBoardCopy:function(){const e=[];return t.forEach((t=>e.push([...t]))),e}}},s=c(),a=function(){let e=r;function n(){const e=s.getBoard();let n;do{const e=Math.floor(3*Math.random()),r=Math.floor(3*Math.random());n=t(e,r)}while(e[n.x][n.y]);return n}function r(){const e=s.getBoardCopy(),t=c(e),n=u.getCurrentPlayer();return o(t,u.getPlayers().indexOf(n)).xy}function o(e,n,r=1){const i=[],s=u.getPlayers()[n]===u.getCurrentPlayer();let a=0;for(let n=0;n<3;n++)for(let r=0;r<3;r++)e.getBoard()[r]&&e.getBoard()[r][n]||(i.push({xy:t(r,n)}),a++);const l=9-a;return 0===i.length&&(console.error("minimax couldn't find any valid moves!"),console.log(`current turn in simulation: ${e.getTurnCount()}, depth: ${r}`)),i.some((t=>{const i=e.getBoardCopy(),a=c(i);if(a.trySet(t.xy,u.getPlayers()[n]),a.checkWinner(u.getPlayers()[n])){if(s)return t.val=10,!0;t.val=-10}else if(l>=8)t.val=0;else{const e=(n+1)%u.getPlayers().length;t.val=o(a,e,r+1).val}return!1})),i.sort(((e,t)=>s?t.val-e.val:e.val-t.val)),i[0]}return{setAI:function(t){e="hard"===t?r:n},getPosition:function(){return e()}}}(),l=function(t,n){return{mark:t,type:n,takeTurn:function(){if("ai"!==n)return!1;const r=a.getPosition(t);e.invoke("movePlayed",r)}}};u.init()})();