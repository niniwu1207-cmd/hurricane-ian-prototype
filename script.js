const snapshots = [
  {src:'hurricane_24h.png',label:'24 hours before landfall',date:'Sep 27, 2022 · 19:06 UTC'},
  {src:'hurricane_12h.png',label:'12.1 hours before landfall',date:'Sep 28, 2022 · 07:01 UTC'},
  {src:'hurricane_1h.png',label:'0.1 hours before landfall',date:'Sep 28, 2022 · 19:01 UTC'}
];
const slider=document.getElementById('timeSlider');
function update(){const i=Number(slider.value),s=snapshots[i];document.getElementById('stormImage').src=s.src;document.getElementById('stormImage').alt=`GOES-16 infrared satellite image of Hurricane Ian ${s.label}`;document.getElementById('timeLabel').textContent=s.label;document.getElementById('dateLabel').textContent=s.date;document.getElementById('previous').disabled=i===0;document.getElementById('next').disabled=i===2;}
slider.addEventListener('input',update);
document.getElementById('previous').addEventListener('click',()=>{slider.value=Math.max(0,Number(slider.value)-1);update();});
document.getElementById('next').addEventListener('click',()=>{slider.value=Math.min(2,Number(slider.value)+1);update();});
update();
