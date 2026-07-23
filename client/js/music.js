const sharps=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],flats=["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
const note=(n,s)=>{const set=n.includes("b")?flats:sharps;let i=sharps.indexOf(n);if(i<0)i=flats.indexOf(n);return i<0?n:set[(i+s%12+12)%12]};
export const transposeChord=(chord,steps)=>!steps?chord:chord.replace(/^([A-G](?:#|b)?)([^/]*)(?:\/([A-G](?:#|b)?))?$/,(_,root,suffix,bass)=>`${note(root,steps)}${suffix}${bass?`/${note(bass,steps)}`:""}`);
export const chordLine=(line,steps)=>{const chars=[];(line.chords||[]).forEach(({chord,position})=>{const value=transposeChord(chord,steps);for(let i=0;i<value.length;i++)chars[Math.max(0,position)+i]=value[i]});return chars.map(x=>x||" ").join("")};

const chordPattern=/^[A-G](?:#|b)?(?:(?:maj|min|m|dim|aug|sus|add)\d*|\d*)?(?:\/[A-G](?:#|b)?)?$/;
const sectionType=label=>{const value=label.toLowerCase();if(value.includes("chorus")||value.includes("hook"))return"chorus";if(value.includes("verse"))return"verse";if(value.includes("pre"))return"pre-chorus";if(value.includes("bridge"))return"bridge";if(value.includes("instrumental"))return"instrumental";if(value.includes("intro"))return"intro";if(value.includes("outro"))return"outro";return"section"};
const chordItems=line=>[...line.matchAll(/\S+/g)].filter(match=>chordPattern.test(match[0])).map(match=>({chord:match[0],position:match.index}));
const isChordLine=line=>{const tokens=line.trim().split(/\s+/).filter(token=>token&&!/^\(x\d+\)$/i.test(token));return tokens.length>0&&tokens.every(token=>chordPattern.test(token))};

export function parseChordSheet(text){
  const sections=[];let current={type:"section",label:"Song",lines:[]},pending=null,chordRows=0,lyricRows=0;
  const flushChord=()=>{if(pending){current.lines.push({lyrics:"",chords:chordItems(pending)});chordRows++}pending=null};
  const flushSection=()=>{flushChord();if(current.lines.length)sections.push(current)};
  for(const rawLine of String(text||"").split(/\r?\n/)){
    const trimmed=rawLine.trim(),heading=trimmed.match(/^\[(.+)]$/);
    if(heading){flushSection();current={type:sectionType(heading[1]),label:heading[1],lines:[]}}
    else if(!trimmed)flushChord();
    else if(isChordLine(rawLine)){flushChord();pending=rawLine}
    else{current.lines.push({lyrics:trimmed,chords:pending?chordItems(pending):[]});if(pending)chordRows++;lyricRows++;pending=null}
  }
  flushSection();
  return{data:{sections},stats:{sections:sections.length,chordRows,lyricRows},detected:sections.length>0&&chordRows>0};
}
