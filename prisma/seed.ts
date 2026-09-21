import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  CEFRLevel,
  MediaType,
  PrismaClient,
  QuestionCategory,
  type Prisma,
} from '../server/src/generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL não configurada.');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const q = (
  level: CEFRLevel,
  category: QuestionCategory,
  prompt: string,
  options: string[],
  correctAnswer: string,
  explanation: string,
  media?: { mediaType: MediaType; mediaUrl: string },
): Prisma.QuestionCreateManyInput => ({
  level,
  category,
  prompt,
  options,
  correctAnswer,
  explanation,
  mediaType: media?.mediaType,
  mediaUrl: media?.mediaUrl,
});

const questions: Prisma.QuestionCreateManyInput[] = [
  q(CEFRLevel.A1, QuestionCategory.GRAMMAR, 'Complete: “Yo ___ estudiante.”', ['soy', 'eres', 'somos', 'está'], 'soy', 'Com “yo”, o verbo ser no presente é “soy”.'),
  q(CEFRLevel.A1, QuestionCategory.VOCABULARY, '¿Cuál palabra significa “casa”?', ['mesa', 'casa', 'calle', 'puerta'], 'casa', '“Casa” tem o mesmo significado em português e espanhol.'),
  q(CEFRLevel.A1, QuestionCategory.GRAMMAR, 'Elige la opción correcta: “Ella ___ de Brasil.”', ['es', 'soy', 'eres', 'son'], 'es', 'Para “ella”, usamos “es”.'),
  q(CEFRLevel.A1, QuestionCategory.VOCABULARY, '¿Cuál es un saludo de la mañana?', ['Buenas noches', 'Buenos días', 'Hasta luego', 'Perdón'], 'Buenos días', '“Buenos días” é usado pela manhã.'),
  q(CEFRLevel.A1, QuestionCategory.LISTENING, 'Escucha el audio. ¿Dónde vive Ana?', ['Madrid', 'Bogotá', 'São Paulo', 'Lima'], 'Madrid', 'O áudio diz: “Ana vive en Madrid”.', { mediaType: MediaType.AUDIO, mediaUrl: '/media/listening-a1.mp3' }),

  q(CEFRLevel.A2, QuestionCategory.GRAMMAR, 'Completa: “Ayer nosotros ___ al cine.”', ['vamos', 'fuimos', 'iremos', 'íbamos'], 'fuimos', 'Para uma ação concluída no passado, “ir” no pretérito indefinido é “fuimos”.'),
  q(CEFRLevel.A2, QuestionCategory.VOCABULARY, '¿Qué palabra se relaciona con viajar en avión?', ['aeropuerto', 'panadería', 'farmacia', 'biblioteca'], 'aeropuerto', '“Aeropuerto” é o local de embarque e desembarque de aviões.'),
  q(CEFRLevel.A2, QuestionCategory.GRAMMAR, 'Elige: “¿___ años tienes?”', ['Cuánto', 'Cuántos', 'Cuál', 'Dónde'], 'Cuántos', '“Años” é plural e contável; usa-se “cuántos”.'),
  q(CEFRLevel.A2, QuestionCategory.VOCABULARY, '“Tengo sueño” significa:', ['Estou com fome', 'Estou com sono', 'Estou com medo', 'Estou com pressa'], 'Estou com sono', '“Sueño” nesse contexto significa sono.'),
  q(CEFRLevel.A2, QuestionCategory.LISTENING, 'Escucha el audio. ¿A qué hora empieza la clase?', ['A las ocho', 'A las nueve', 'A las diez', 'A las once'], 'A las nueve', 'O áudio informa que a aula começa às nove.', { mediaType: MediaType.AUDIO, mediaUrl: '/media/listening-a2.mp3' }),

  q(CEFRLevel.B1, QuestionCategory.GRAMMAR, 'Completa: “Si tengo tiempo, ___ contigo.”', ['iría', 'voy', 'fuera', 'iba'], 'voy', 'Na condição real com “si + presente”, a oração principal pode usar presente.'),
  q(CEFRLevel.B1, QuestionCategory.VOCABULARY, '¿Qué significa “aprovechar una oportunidad”?', ['Rechazarla', 'Utilizarla bien', 'Olvidarla', 'Ocultarla'], 'Utilizarla bien', '“Aprovechar” é tirar bom proveito de algo.'),
  q(CEFRLevel.B1, QuestionCategory.GRAMMAR, 'Elige la forma correcta: “Espero que tú ___ mañana.”', ['vienes', 'vendrás', 'vengas', 'viniste'], 'vengas', 'Depois de “espero que”, usa-se subjuntivo: “vengas”.'),
  q(CEFRLevel.B1, QuestionCategory.VOCABULARY, '“Echar de menos” equivale a:', ['Sentir saudade', 'Jogar fora', 'Ficar bravo', 'Se atrasar'], 'Sentir saudade', 'A expressão significa sentir falta/saudade.'),
  q(CEFRLevel.B1, QuestionCategory.LISTENING, 'Escucha el audio. ¿Por qué Carlos llegará tarde?', ['Porque perdió el autobús', 'Porque está enfermo', 'Porque trabaja', 'Porque llueve'], 'Porque perdió el autobús', 'Carlos explica que perdeu o ônibus.', { mediaType: MediaType.AUDIO, mediaUrl: '/media/listening-b1.mp3' }),

  q(CEFRLevel.B2, QuestionCategory.GRAMMAR, 'Completa: “Aunque ___ cansado, terminaré el trabajo.”', ['estoy', 'esté', 'estaré', 'estaba'], 'esté', 'Com valor concessivo e situação não afirmada, “aunque” pede subjuntivo.'),
  q(CEFRLevel.B2, QuestionCategory.VOCABULARY, 'En contexto profesional, “plazo” suele referirse a:', ['Um salário', 'Um prazo de tempo', 'Uma reunião', 'Um contrato'], 'Um prazo de tempo', '“Plazo” é o período limite para concluir algo.'),
  q(CEFRLevel.B2, QuestionCategory.GRAMMAR, 'Elige: “No creo que ellos ___ razón.”', ['tienen', 'tendrán', 'tengan', 'tuvieron'], 'tengan', 'Negação de crença/opinião normalmente exige subjuntivo.'),
  q(CEFRLevel.B2, QuestionCategory.VOCABULARY, '“Dar por hecho” significa:', ['Considerar algo certo', 'Explicar detalhadamente', 'Cancelar algo', 'Duvidar de tudo'], 'Considerar algo certo', 'A locução indica assumir algo como certo.'),
  q(CEFRLevel.B2, QuestionCategory.LISTENING, 'Escucha el audio. ¿Qué propone Laura para resolver el problema?', ['Cancelar el proyecto', 'Cambiar la fecha de entrega', 'Contratar a otra empresa', 'Reducir el presupuesto'], 'Cambiar la fecha de entrega', 'Laura sugere alterar a data de entrega.', { mediaType: MediaType.AUDIO, mediaUrl: '/media/listening-b2.mp3' }),

  q(CEFRLevel.C1, QuestionCategory.GRAMMAR, 'Elige la opción más adecuada: “De haberlo sabido, ___ antes.”', ['vendría', 'habría venido', 'vine', 'venía'], 'habría venido', 'A estrutura contrafactual no passado pede condicional composto.'),
  q(CEFRLevel.C1, QuestionCategory.VOCABULARY, '“Un argumento endeble” es un argumento:', ['Sólido', 'Débil', 'Extenso', 'Imparcial'], 'Débil', '“Endeble” significa fraco ou pouco consistente.'),
  q(CEFRLevel.C1, QuestionCategory.GRAMMAR, 'Completa: “Por mucho que ___, no cambiará de opinión.”', ['insistes', 'insistirás', 'insistas', 'insististe'], 'insistas', 'A construção concessiva “por mucho que” exige subjuntivo.'),
  q(CEFRLevel.C1, QuestionCategory.VOCABULARY, '“Soslayar un asunto” significa:', ['Abordarlo de frente', 'Evitarlo o pasarlo por alto', 'Resolverlo', 'Publicarlo'], 'Evitarlo o pasarlo por alto', '“Soslayar” é evitar ou contornar um tema.'),
  q(CEFRLevel.C1, QuestionCategory.LISTENING, 'Escucha el audio. ¿Cuál es la principal preocupación del hablante?', ['La falta de datos confiables', 'El costo del viaje', 'La duración de la reunión', 'La calidad del edificio'], 'La falta de datos confiables', 'O falante destaca a falta de dados confiáveis.', { mediaType: MediaType.AUDIO, mediaUrl: '/media/listening-c1.mp3' }),

  q(CEFRLevel.C2, QuestionCategory.GRAMMAR, 'Selecciona la opción que mejor completa: “Sea cual ___ el desenlace, mantendremos el acuerdo.”', ['sea', 'fuera', 'será', 'es'], 'sea', 'A expressão fixa é “sea cual sea”.'),
  q(CEFRLevel.C2, QuestionCategory.VOCABULARY, '“Una observación palmaria” es una observación:', ['Evidente', 'Ambigua', 'Irónica', 'Irrelevante'], 'Evidente', '“Palmario” significa claro, patente, evidente.'),
  q(CEFRLevel.C2, QuestionCategory.GRAMMAR, 'Elige la frase más natural y normativa:', ['No bien llegó, empezó la reunión.', 'No bien llegaría, empezó la reunión.', 'No bien llegando, empezó la reunión.', 'No bien llega ayer, empezó la reunión.'], 'No bien llegó, empezó la reunión.', '“No bien” pode funcionar como conjunção temporal equivalente a “assim que”.'),
  q(CEFRLevel.C2, QuestionCategory.VOCABULARY, '“Irse por las ramas” significa:', ['Ser muy directo', 'Desviarse del tema principal', 'Caminar por el bosque', 'Cambiar de idioma'], 'Desviarse del tema principal', 'A expressão indica divagar ou afastar-se do assunto.'),
  q(CEFRLevel.C2, QuestionCategory.LISTENING, 'Escucha el audio. ¿Qué matiz transmite el hablante sobre la propuesta?', ['Entusiasmo absoluto', 'Aceptación con reservas', 'Rechazo categórico', 'Indiferencia total'], 'Aceptación con reservas', 'O falante concorda, mas aponta ressalvas importantes.', { mediaType: MediaType.AUDIO, mediaUrl: '/media/listening-c2.mp3' }),
];

async function main() {
  const count = await prisma.question.count();

  if (count === 0) {
    await prisma.question.createMany({ data: questions });
  }

  console.log(`Seed concluído. Questões disponíveis: ${await prisma.question.count()}`);
}
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
