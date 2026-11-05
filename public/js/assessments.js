document.addEventListener('DOMContentLoaded',()=>{
 const form=document.getElementById('assessmentForm'); if(!form)return;
 const sections=[...form.querySelectorAll('.assessment-section')];let current=0;
 const nav=form.querySelector('.section-nav'); nav.hidden=false;
 function show(index){current=index;sections.forEach((s,i)=>s.hidden=i!==current);document.getElementById('previousSection').disabled=current===0;document.getElementById('nextSection').disabled=current===sections.length-1;document.getElementById('sectionText').textContent=`Section ${current+1} of ${sections.length}`;document.getElementById('assessmentSubmit').hidden=current!==sections.length-1;}
 function update(){const count=form.querySelectorAll('input[type=radio]:checked').length;document.getElementById('assessmentProgress').value=count;document.getElementById('progressText').textContent=`${count} of 60 completed`;}
 const missing=sections.findIndex(s=>[...s.querySelectorAll('fieldset')].some(f=>!f.querySelector(':checked')));show(missing<0?0:missing);update();
 form.addEventListener('change',update);
 document.getElementById('previousSection').onclick=()=>{show(current-1);sections[current].querySelector('h2').focus();};
 document.getElementById('nextSection').onclick=()=>{const missing=[...sections[current].querySelectorAll('fieldset')].find(f=>!f.querySelector(':checked'));if(missing){missing.querySelector('input').reportValidity();return;}show(current+1);sections[current].querySelector('h2').focus();};
 form.addEventListener('invalid',event=>{const parent=event.target.closest('.assessment-section');if(parent)show(sections.indexOf(parent));},true);
});
