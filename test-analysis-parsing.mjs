import { createAnalysisPrompt, parseAnalysisResponse } from './server/enneagram-analysis-prompt.ts';

// Simulated LLM response (what we expect from the LLM)
const simulatedLLMResponse = `# Analyse: Der Friedensstifter

## Persönliche Typ-Beschreibung

Du bist ein Typ 9 mit Flügel 8 – der "Friedensstifter mit innerer Stärke". Diese Kombination macht dich zu jemandem, der Harmonie und Frieden schätzt, aber gleichzeitig eine überraschende innere Kraft und Entschlossenheit besitzt. Du suchst nach Ausgeglichenheit in deinem Leben und in deinen Beziehungen, aber wenn es darauf ankommt, kannst du auch für das einstehen, was dir wichtig ist.

Deine 9er-Energie zeigt sich in deinem Wunsch, Konflikte zu vermeiden und alle Seiten zu verstehen. Du hast die Gabe, verschiedene Perspektiven zu sehen und Menschen zusammenzubringen. Gleichzeitig verleiht dir der 8er-Flügel eine gewisse Direktheit und Stärke, die andere Neunen oft nicht haben.

## Kindheit-Muster

In deiner Kindheit hast du wahrscheinlich gelernt, dass es sicherer ist, deine eigenen Bedürfnisse zurückzustellen, um Frieden zu bewahren. Vielleicht gab es Konflikte in deiner Familie, die du nicht kontrollieren konntest, und du hast eine Strategie entwickelt, dich "unsichtbar" zu machen oder zu vermitteln.

## Stärken

- **Empathie und Verständnis**: Du kannst dich in andere hineinversetzen und verschiedene Standpunkte verstehen
- **Innere Ruhe**: Du strahlst eine beruhigende Präsenz aus, die andere anzieht
- **Vermittlungsfähigkeit**: Du kannst Brücken zwischen Menschen bauen
- **Durchsetzungsvermögen** (durch 8er-Flügel): Wenn es wirklich wichtig ist, kannst du für deine Überzeugungen einstehen

## Herausforderungen

- **Selbstvergessenheit**: Du verlierst dich manchmal in den Bedürfnissen anderer und vergisst deine eigenen
- **Passiv-aggressives Verhalten**: Statt Konflikte direkt anzusprechen, ziehst du dich zurück oder wirst indirekt
- **Prokrastination**: Du schiebst unangenehme Entscheidungen auf, um Harmonie zu bewahren
- **Schwierigkeit, Prioritäten zu setzen**: Alles erscheint gleich wichtig, was zu Überforderung führen kann

## Beziehungen

In Beziehungen bist du loyal und unterstützend. Du möchtest, dass alle glücklich sind, und investierst viel Energie, um Harmonie zu schaffen. Dein 8er-Flügel gibt dir die Fähigkeit, auch in schwierigen Zeiten standhaft zu bleiben. Achte darauf, deine eigenen Bedürfnisse nicht zu vernachlässigen – eine gesunde Beziehung bedeutet auch, dass du für dich selbst einstehst.

## Entwicklungstipp

Dein Wachstumspfad führt dich zu Typ 3 – dem Erfolgsmensch. Das bedeutet: Lerne, deine eigenen Ziele zu verfolgen und dich selbst wichtig zu nehmen. Setze dir klare Prioritäten und handle danach. Deine innere Stärke (8er-Flügel) ist bereits da – nutze sie, um aktiv dein Leben zu gestalten, statt nur zu reagieren. Übe, "Nein" zu sagen, wenn es nötig ist, und erkenne, dass Konflikte manchmal notwendig sind für echtes Wachstum.`;

console.log('=== Testing LLM Analysis Parsing ===\n');

try {
  const parsed = parseAnalysisResponse(simulatedLLMResponse);
  
  console.log('✅ Parsing successful!');
  console.log('\nParsed Analysis:');
  console.log(JSON.stringify(parsed, null, 2));
  
  // Verify all required fields are present
  const requiredFields = ['typeTitle', 'description', 'childhood', 'strengths', 'challenges', 'relationships', 'developmentTip'];
  const missingFields = requiredFields.filter(field => !parsed[field]);
  
  if (missingFields.length > 0) {
    console.error('\n❌ Missing required fields:', missingFields);
  } else {
    console.log('\n✅ All required fields present');
  }
  
} catch (error) {
  console.error('❌ Parsing failed:', error.message);
  console.error(error.stack);
}
