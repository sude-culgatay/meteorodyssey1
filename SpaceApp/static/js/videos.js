const papers = [
  { title:"Çıtır Videolar", emoji:"🎬", videos:[
    {type:"link", link:"https://science.nasa.gov/resource/stardust-swoops-by-tempel-1/"},
    {type:"link", link:"https://www.jpl.nasa.gov/videos/stardust-why-bring-a-comet-home/"}
  ]},
  { title:"Çıtır Videolar", emoji:"📺", videos:[
    {type:"yt", src:"https://www.youtube.com/embed/16HaZ9BieTI", link:"https://www.youtube.com/watch?v=16HaZ9BieTI"},
    {type:"yt", src:"https://www.youtube.com/embed/FG4KsatjFeI", link:"https://youtu.be/FG4KsatjFeI"}
  ]},
  { title:"Çıtır Videolar", emoji:"☄️", videos:[
    {type:"yt", src:"https://www.youtube.com/embed/gbsqWozEBBw", link:"https://youtu.be/gbsqWozEBBw"},
    {type:"link", link:"https://science.nasa.gov/resource/deep-impact-approach-and-impact/"}
  ]},
  { title:"Çıtır Videolar", emoji:"🚀", videos:[
    {type:"yt", src:"https://www.youtube.com/embed/pc4A8va8NRU", link:"https://www.youtube.com/watch?v=pc4A8va8NRU"},
    {type:"yt", src:"https://www.youtube.com/embed/-vzafaw0t08", link:"https://www.youtube.com/watch?v=-vzafaw0t08"}
  ]}
];

const stackEl=document.getElementById("stack");
const popup=document.getElementById("popup");
const overlay=document.getElementById("overlay");
const popupTitle=document.getElementById("popupTitle");
const boxGrid=document.getElementById("boxGrid");
const prevBtn=document.getElementById("prevBtn");
const nextBtn=document.getElementById("nextBtn");
const pageIndicator=document.getElementById("pageIndicator");
const closePopup=document.getElementById("closePopup");
let current=0;

function createPapers(){
  papers.forEach((p,i)=>{
    const el=document.createElement("div");
    el.className=`paper p${i}`;
    el.innerHTML=`<div class="emoji">${p.emoji}</div><div class="label">${p.title}</div>`;
    el.onclick=()=>openPopup(i);
    stackEl.appendChild(el);
  });
}
function openPopup(i){
  current=i;
  popupTitle.textContent=papers[i].title;
  boxGrid.innerHTML="";
  papers[i].videos.forEach(v=>{
    const vb=document.createElement("div");
    vb.className="video-box";
    if(v.type==="yt"){
      vb.innerHTML=`<iframe src="${v.src}" frameborder="0" allowfullscreen></iframe>
        <a href="${v.link}" target="_blank">YouTube’da izle</a>`;
    }else{
      vb.innerHTML=`<a href="${v.link}" target="_blank">🔗 NASA’da izle</a>`;
    }
    boxGrid.appendChild(vb);
  });
  updateNav();
  popup.classList.add("show"); overlay.classList.add("show");
}
function updateNav(){
  pageIndicator.textContent=`${current+1}/${papers.length}`;
  prevBtn.disabled=current===0;
  nextBtn.disabled=current===papers.length-1;
}
function goPrev(){ if(current>0) openPopup(current-1); }
function goNext(){ if(current<papers.length-1) openPopup(current+1); }
function closeIt(){
  popup.classList.remove("show");
  overlay.classList.remove("show");
}

prevBtn.onclick=goPrev; nextBtn.onclick=goNext; closePopup.onclick=closeIt; overlay.onclick=closeIt;
document.addEventListener("keydown",e=>{
  if(!popup.classList.contains("show")) return;
  if(e.key==="Escape") closeIt();
  if(e.key==="ArrowLeft") goPrev();
  if(e.key==="ArrowRight") goNext();
});

createPapers();