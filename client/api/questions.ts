export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type Category = 'GRAMMAR' | 'VOCABULARY' | 'LISTENING';

export type PlacementQuestion = {
  id: string;
  level: Level;
  category: Category;
  prompt: string;
  options: string[];
  correctAnswer: string;
  mediaType?: 'AUDIO';
  mediaUrl?: string;
};

export const questions: PlacementQuestion[] = [
  { id:'q01', level:'A1', category:'GRAMMAR', prompt:'Complete: “Yo ___ estudiante.”', options:['soy','eres','somos','está'], correctAnswer:'soy' },
  { id:'q02', level:'A1', category:'VOCABULARY', prompt:'¿Cuál palabra significa “casa”?', options:['mesa','casa','calle','puerta'], correctAnswer:'casa' },
  { id:'q03', level:'A1', category:'GRAMMAR', prompt:'Elige la opción correcta: “Ella ___ de Brasil.”', options:['es','soy','eres','son'], correctAnswer:'es' },
  { id:'q04', level:'A1', category:'VOCABULARY', prompt:'¿Cuál es un saludo de la mañana?', options:['Buenas noches','Buenos días','Hasta luego','Perdón'], correctAnswer:'Buenos días' },
  { id:'q05', level:'A1', category:'LISTENING', prompt:'Escucha el audio. ¿Dónde vive Ana?', options:['Madrid','Bogotá','São Paulo','Lima'], correctAnswer:'Madrid', mediaType:'AUDIO', mediaUrl:'/media/listening-a1.mp3' },

  { id:'q06', level:'A2', category:'GRAMMAR', prompt:'Completa: “Ayer nosotros ___ al cine.”', options:['vamos','fuimos','iremos','íbamos'], correctAnswer:'fuimos' },
  { id:'q07', level:'A2', category:'VOCABULARY', prompt:'¿Qué palabra se relaciona con viajar en avión?', options:['aeropuerto','panadería','farmacia','biblioteca'], correctAnswer:'aeropuerto' },
  { id:'q08', level:'A2', category:'GRAMMAR', prompt:'Elige: “¿___ años tienes?”', options:['Cuánto','Cuántos','Cuál','Dónde'], correctAnswer:'Cuántos' },
  { id:'q09', level:'A2', category:'VOCABULARY', prompt:'“Tengo sueño” significa:', options:['Estou com fome','Estou com sono','Estou com medo','Estou com pressa'], correctAnswer:'Estou com sono' },
  { id:'q10', level:'A2', category:'LISTENING', prompt:'Escucha el audio. ¿A qué hora empieza la clase?', options:['A las ocho','A las nueve','A las diez','A las once'], correctAnswer:'A las nueve', mediaType:'AUDIO', mediaUrl:'/media/listening-a2.mp3' },

  { id:'q11', level:'B1', category:'GRAMMAR', prompt:'Completa: “Si tengo tiempo, ___ contigo.”', options:['iría','voy','fuera','iba'], correctAnswer:'voy' },
  { id:'q12', level:'B1', category:'VOCABULARY', prompt:'¿Qué significa “aprovechar una oportunidad”?', options:['Rechazarla','Utilizarla bien','Olvidarla','Ocultarla'], correctAnswer:'Utilizarla bien' },
  { id:'q13', level:'B1', category:'GRAMMAR', prompt:'Elige la forma correcta: “Espero que tú ___ mañana.”', options:['vienes','vendrás','vengas','viniste'], correctAnswer:'vengas' },
  { id:'q14', level:'B1', category:'VOCABULARY', prompt:'“Echar de menos” equivale a:', options:['Sentir saudade','Jogar fora','Ficar bravo','Se atrasar'], correctAnswer:'Sentir saudade' },
  { id:'q15', level:'B1', category:'LISTENING', prompt:'Escucha el audio. ¿Por qué Carlos llegará tarde?', options:['Porque perdió el autobús','Porque está enfermo','Porque trabaja','Porque llueve'], correctAnswer:'Porque perdió el autobús', mediaType:'AUDIO', mediaUrl:'/media/listening-b1.mp3' },

  { id:'q16', level:'B2', category:'GRAMMAR', prompt:'Completa: “Aunque ___ cansado, terminaré el trabajo.”', options:['estoy','esté','estaré','estaba'], correctAnswer:'esté' },
  { id:'q17', level:'B2', category:'VOCABULARY', prompt:'En contexto profesional, “plazo” suele referirse a:', options:['Um salário','Um prazo de tempo','Uma reunião','Um contrato'], correctAnswer:'Um prazo de tempo' },
  { id:'q18', level:'B2', category:'GRAMMAR', prompt:'Elige: “No creo que ellos ___ razón.”', options:['tienen','tendrán','tengan','tuvieron'], correctAnswer:'tengan' },
  { id:'q19', level:'B2', category:'VOCABULARY', prompt:'“Dar por hecho” significa:', options:['Considerar algo certo','Explicar detalhadamente','Cancelar algo','Duvidar de tudo'], correctAnswer:'Considerar algo certo' },
  { id:'q20', level:'B2', category:'LISTENING', prompt:'Escucha el audio. ¿Qué propone Laura para resolver el problema?', options:['Cancelar el proyecto','Cambiar la fecha de entrega','Contratar a otra empresa','Reducir el presupuesto'], correctAnswer:'Cambiar la fecha de entrega', mediaType:'AUDIO', mediaUrl:'/media/listening-b2.mp3' },

  { id:'q21', level:'C1', category:'GRAMMAR', prompt:'Elige la opción más adecuada: “De haberlo sabido, ___ antes.”', options:['vendría','habría venido','vine','venía'], correctAnswer:'habría venido' },
  { id:'q22', level:'C1', category:'VOCABULARY', prompt:'“Un argumento endeble” es un argumento:', options:['Sólido','Débil','Extenso','Imparcial'], correctAnswer:'Débil' },
  { id:'q23', level:'C1', category:'GRAMMAR', prompt:'Completa: “Por mucho que ___, no cambiará de opinión.”', options:['insistes','insistirás','insistas','insististe'], correctAnswer:'insistas' },
  { id:'q24', level:'C1', category:'VOCABULARY', prompt:'“Soslayar un asunto” significa:', options:['Abordarlo de frente','Evitarlo o pasarlo por alto','Resolverlo','Publicarlo'], correctAnswer:'Evitarlo o pasarlo por alto' },
  { id:'q25', level:'C1', category:'LISTENING', prompt:'Escucha el audio. ¿Cuál es la principal preocupación del hablante?', options:['La falta de datos confiables','El costo del viaje','La duración de la reunión','La calidad del edificio'], correctAnswer:'La falta de datos confiables', mediaType:'AUDIO', mediaUrl:'/media/listening-c1.mp3' },

  { id:'q26', level:'C2', category:'GRAMMAR', prompt:'Selecciona la opción que mejor completa: “Sea cual ___ el desenlace, mantendremos el acuerdo.”', options:['sea','fuera','será','es'], correctAnswer:'sea' },
  { id:'q27', level:'C2', category:'VOCABULARY', prompt:'“Una observación palmaria” es una observación:', options:['Evidente','Ambigua','Irónica','Irrelevante'], correctAnswer:'Evidente' },
  { id:'q28', level:'C2', category:'GRAMMAR', prompt:'Elige la frase más natural y normativa:', options:['No bien llegó, empezó la reunión.','No bien llegaría, empezó la reunión.','No bien llegando, empezó la reunión.','No bien llega ayer, empezó la reunión.'], correctAnswer:'No bien llegó, empezó la reunión.' },
  { id:'q29', level:'C2', category:'VOCABULARY', prompt:'“Irse por las ramas” significa:', options:['Ser muy directo','Desviarse del tema principal','Caminar por el bosque','Cambiar de idioma'], correctAnswer:'Desviarse del tema principal' },
  { id:'q30', level:'C2', category:'LISTENING', prompt:'Escucha el audio. ¿Qué matiz transmite el hablante sobre la propuesta?', options:['Entusiasmo absoluto','Aceptación con reservas','Rechazo categórico','Indiferencia total'], correctAnswer:'Aceptación con reservas', mediaType:'AUDIO', mediaUrl:'/media/listening-c2.mp3' },
];
