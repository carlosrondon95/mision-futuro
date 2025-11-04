(function(){
  const QUESTIONS = [
    { id:'age',    q:'¿Cuál es tu rango de edad?', opts:['16–18 años','19–25 años','25+ años'] },
    { id:'studies',q:'¿Qué estudios has completado?', opts:['Bachillerato','Ciclo Formativo GM','Ciclo Formativo GS','Universidad / Máster'] },
    { id:'type',   q:'¿Qué tipo de trabajo te motiva más?', opts:['Seguridad y acción','Administración / gestión','Docencia y formación','Tecnología y planificación'] },
    { id:'mode',   q:'¿Cómo prefieres estudiar?', opts:['100% online','Presencial'] },
    { id:'hours',  q:'¿Cuántas horas puedes dedicar al estudio?', opts:['Menos de 10h','10–20h','Más de 20h'] },
    { id:'social', q:'¿Quieres un trabajo con contacto directo con personas?', opts:['Sí','No'] },
    { id:'goal',   q:'¿Qué valoras más en tu futura oposición?', opts:['Estabilidad laboral y salario','Crecimiento profesional y ascensos','Impacto social / vocación docente'] },
    { id:'form',   q:'Déjanos tus datos y te enviaremos tu resultado', opts:[] }
  ];

  function freshScore(){
    return { 'Guardia Civil':0,'Policía Nacional':0,'Prisiones':0,'AGE':0,'Profesorado':0,'Tropa y Marinería':0 };
  }

  function applyScoring(score, choice){
    const {id, value} = choice;
    switch(id){
      case 'type':
        if (value==='Seguridad y acción'){ score['Guardia Civil']+=3; score['Policía Nacional']+=3; score['Tropa y Marinería']+=2; }
        if (value==='Administración / gestión'){ score['AGE']+=3; score['Prisiones']+=2; }
        if (value==='Docencia y formación'){ score['Profesorado']+=4; }
        if (value==='Tecnología y planificación'){ score['AGE']+=2; score['Guardia Civil']+=1; score['Policía Nacional']+=1; }
        break;
      case 'hours':
        if (value==='Más de 20h'){ score['Guardia Civil']+=2; score['Policía Nacional']+=2; score['Profesorado']+=2; }
        if (value==='Menos de 10h'){ score['AGE']+=2; }
        break;
      case 'social':
        if (value==='Sí'){ score['Profesorado']+=3; score['Guardia Civil']+=2; score['Policía Nacional']+=2; }
        if (value==='No'){ score['AGE']+=2; score['Prisiones']+=2; }
        break;
      case 'goal':
        if (value.includes('Estabilidad')) Object.keys(score).forEach(k=>score[k]+=1);
        if (value.includes('Crecimiento')) { score['Guardia Civil']+=2; score['Policía Nacional']+=2; score['Profesorado']+=2; }
        if (value.includes('Impacto')) { score['Profesorado']+=3; }
        break;
      case 'studies':
        if (value==='Universidad / Máster'){ score['Profesorado']+=1; }
        break;
    }
    return score;
  }

  function winner(score){
    const arr = Object.entries(score).sort((a,b)=>b[1]-a[1]);
    const top1 = arr[0] ? arr[0][0] : 'AGE';
    const top2 = (arr[1] && arr[1][1]===arr[0][1]) ? arr[1][0] : null;
    return { top1, top2 };
  }

  function bullets(name){
    switch(name){
      case 'Guardia Civil': return ['Vocación de servicio y acción','Itinerario estructurado','Proyección interna'];
      case 'Policía Nacional': return ['Seguridad ciudadana','Especialidades variadas','Carrera y ascensos'];
      case 'Prisiones': return ['Estabilidad y servicio público','Ámbito técnico y humano','Formación continua'];
      case 'AGE': return ['Administración y gestión','Conciliación y estabilidad','Múltiples ministerios'];
      case 'Profesorado': return ['Impacto social directo','Vocación docente','Crecimiento por especialidad'];
      case 'Tropa y Marinería': return ['Trabajo en equipo','Disciplina y unidad','Formación específica'];
      default: return ['Itinerario recomendado','Formación guiada','Acompañamiento experto'];
    }
  }

  window.QRData = { QUESTIONS, freshScore, applyScoring, winner, bullets };
})();
