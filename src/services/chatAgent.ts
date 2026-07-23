import { GoogleGenAI, Type } from '@google/genai';
import type { Content, FunctionCall, FunctionDeclaration, Part } from '@google/genai';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ChatConfig {
  chatbotEnabled: boolean;
  geminiApiKey: string;
  geminiModel: string;
}

export type StepType = 'thinking' | 'tool_call' | 'tool_result' | 'text' | 'error';

export interface AgentStep {
  type: StepType;
  content: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  steps?: AgentStep[];
}

// ── Config ───────────────────────────────────────────────────────────────────

export async function loadConfig(): Promise<ChatConfig> {
  const res = await fetch('/config.json');
  return res.json();
}

// ── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert data analyst assistant for the "Bharat in Data" education dashboard. You help users explore Indian education statistics from four datasets stored in a custom Data Commons instance.

## Available Datasets

1. **AISHE** (All India Survey on Higher Education, Ministry of Education)
   - Data years: 2020-2021
   - Covers: Colleges count, Universities count, student enrolment by degree level & gender & social category, teachers by faculty type & gender, Gross Enrolment Ratio (GER), Gender Parity Index (GPI), Pupil-Teacher Ratio (PTR)
   - Stat var pattern: \`AISHE_{Category}_{Subcategory}_{Dimension}\`
   - Examples: AISHE_Colleges_Count, AISHE_Universities_Count, AISHE_Teachers_Total_Male, AISHE_Teachers_ProfessorEquivalent_Female, AISHE_GER_Total_Total, AISHE_GER_ScheduledCaste_Female, AISHE_PTR_Total_Regular, AISHE_Enrolment_PostGraduate_Male, AISHE_GPI

2. **UDISE+** (Unified District Information System for Education, Dept of School Education & Literacy)
   - Data year: 2024
   - Covers: Schools count by level & management type, student enrolment (including CWSN, minorities), dropout/promotion/retention/transition rates, NER/GER/ANER/ASER, trained teachers percentage, library books, pupil-teacher ratio, school facilities (drinking water, electricity, toilets, ICT labs, solar panels, computers), digital initiatives
   - Stat var pattern: \`UDISE_{Category}_{Subcategory}_{Dimension}\`
   - Examples: UDISE_Schools_Count_Primary, UDISE_Schools_Count_Government_Secondary, UDISE_DropoutRate_Primary_Boys, UDISE_GER_Elementary_Total, UDISE_NER_Secondary_Girls, UDISE_Enrolment_CWSN_Elementary_Boys, UDISE_TransitionRate_PrimaryToUpperPrimary_Total, UDISE_PupilTeacherRatio_Primary, UDISE_TrainedTeachers_Percentage_Primary_Total, UDISE_LibraryBooks_PerSchool, UDISE_Schools_DrinkingWater_Government_AnySource, UDISE_Schools_DigitalInit_Desktoppcs_Government

3. **NSS80** (National Sample Survey 80th Round, Ministry of Statistics & Programme Implementation)
   - Data year: 2025
   - Covers: Education expenditure (average per student, per reported student, by items), course fees reporting, private coaching (percentage & expenditure), funding source distribution, household members education patterns
   - Stat var pattern: \`NSS80_{Category}_{Subcategory}_{Dimensions}\`
   - Gender: Male, Female, Total. Location: Rural, Urban, Total.
   - School levels: Primary, UpperPrimary, Middle, Secondary, HigherSecondary
   - School types: SchoolTypeGovernment, SchoolTypeAllNonGovernment
   - Examples: NSS80_Expenditure_AveragePerStudent_Primary_SchoolTypeGovernment, NSS80_Expenditure_ReportedCourseFee_Secondary_Male, NSS80_Coaching_Percentage, NSS80_Coaching_AverageExpenditurePerStudent, NSS80_Funding_SourceDistribution_Female_Rural, NSS80_Households_ErstwhileMembersCountDistribution_Members1

4. **MIS** (Multi-Indicator Surveys)
   - Data year: 2020
   - Covers: Drinking water access, broadband access, mass media, hand wash facilities, latrine access, pucca housing, mobile phone usage, all-weather road access, migration reasons
   - Stat var pattern: \`MIS_{Category}\`
   - Examples: MIS_DrinkingWater_PipedWaterDwellingYard, MIS_Broadband, MIS_MassMedia, MIS_HandWash_WaterAndSoap, MIS_Latrine_ExclusiveImproved, MIS_PuccaStructure, MIS_MobilePhone, MIS_AllWeatherRoad

## Available Entities (Indian States & UTs with DCIDs)

Country: \`country/IND\`

States:
- Andhra Pradesh: wikidataId/Q1159
- Arunachal Pradesh: wikidataId/Q1174
- Assam: wikidataId/Q1164
- Bihar: wikidataId/Q1165
- Chhattisgarh: wikidataId/Q1168
- Delhi: wikidataId/Q1353
- Goa: wikidataId/Q1171
- Gujarat: wikidataId/Q1061
- Haryana: wikidataId/Q1174
- Himachal Pradesh: wikidataId/Q1177
- Jharkhand: wikidataId/Q1180
- Karnataka: wikidataId/Q1185
- Kerala: wikidataId/Q1186
- Madhya Pradesh: wikidataId/Q1188
- Maharashtra: wikidataId/Q1191
- Manipur: wikidataId/Q1193
- Meghalaya: wikidataId/Q1195
- Mizoram: wikidataId/Q1502
- Nagaland: wikidataId/Q1497
- Odisha: wikidataId/Q22048
- Punjab: wikidataId/Q22424
- Rajasthan: wikidataId/Q1437
- Sikkim: wikidataId/Q1505
- Tamil Nadu: wikidataId/Q1445
- Telangana: wikidataId/Q677037
- Tripura: wikidataId/Q1363
- Uttar Pradesh: wikidataId/Q1498
- Uttarakhand: wikidataId/Q1499
- West Bengal: wikidataId/Q1356
- Andaman and Nicobar Islands: wikidataId/Q46013
- Chandigarh: wikidataId/Q66743
- Dadra and Nagar Haveli and Daman and Diu: wikidataId/Q66710
- Jammu and Kashmir: wikidataId/Q66585
- Ladakh: wikidataId/Q200667
- Lakshadweep: wikidataId/Q66568
- Puducherry: wikidataId/Q66550

## How to Query Data

Use the get_observations tool to fetch statistical data. Parameters:
- variable_dcids: Array of stat var names (e.g., ["AISHE_Colleges_Count"])
- entity_dcids: Array of entity DCIDs (e.g., ["country/IND", "wikidataId/Q1185"])
- date: Date string — use "" (empty) to get all available years, or a specific year like "2024"

Use the get_node_info tool to explore entity relationships or discover more about variables.

## Guidelines

- When a user asks about a topic, think about which dataset and stat vars are relevant
- For comparison queries, fetch data for multiple entities or variables
- Always provide specific numbers and context in your answers
- If data is not available, say so clearly
- Be concise but informative
- When showing numbers, format them nicely (e.g., use commas for large numbers)
- If you're unsure which exact stat var to use, try the most likely one first

## Charts in Responses

You can embed interactive charts in your responses using special chart code blocks. When you have data to visualize, include a chart block in your response alongside your text explanation.

Supported chart types: bar, pie, line, horizontal-bar

Format:
\`\`\`chart:bar
{
  "title": "Chart Title",
  "unit": "%",
  "data": [
    {"label": "Category A", "value": 123},
    {"label": "Category B", "value": 456}
  ]
}
\`\`\`

Guidelines for charts:
- Use bar charts for comparing values across categories (states, gender, etc.)
- Use pie charts for showing proportions/distribution (max 8 slices)
- Use line charts for showing trends over time
- Keep data labels short (max 16 chars) — abbreviate state names if needed
- Always include a descriptive title
- Include unit if applicable (%, count, ratio, etc.)
- Limit to 10-12 data items per chart for readability
- When comparing states, pick the most relevant ones rather than showing all 36
- You can include multiple charts in a single response`;

// ── Tool declarations ────────────────────────────────────────────────────────

const TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'get_observations',
    description:
      'Fetch statistical observations from the Data Commons API. Returns time-series data for given statistical variables and entities (states/country).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        variable_dcids: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description:
            'Array of statistical variable DCIDs to query, e.g. ["AISHE_Colleges_Count", "AISHE_Universities_Count"]',
        },
        entity_dcids: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description:
            'Array of entity DCIDs, e.g. ["country/IND", "wikidataId/Q1185"] for India and Karnataka',
        },
        date: {
          type: Type.STRING,
          description:
            'Date filter. Use "" (empty string) for all available years, or a specific year like "2024".',
        },
      },
      required: ['variable_dcids', 'entity_dcids'],
    },
  },
  {
    name: 'get_node_info',
    description:
      'Get properties and relationships of a Data Commons node. Useful for discovering what data is available for an entity or variable.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        nodes: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Array of node DCIDs to query',
        },
        property: {
          type: Type.STRING,
          description:
            'Property expression, e.g. "->name" for name, "->*" for all out-properties, "<-*" for all in-properties',
        },
      },
      required: ['nodes', 'property'],
    },
  },
];

// ── Tool execution ───────────────────────────────────────────────────────────

async function executeGetObservations(args: Record<string, unknown>): Promise<string> {
  const body: Record<string, unknown> = {
    date: (args.date as string) ?? '',
    variable: { dcids: args.variable_dcids },
    entity: { dcids: args.entity_dcids },
    select: ['date', 'entity', 'variable', 'value'],
  };

  const res = await fetch('/api/observation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) return JSON.stringify({ error: `API error: ${res.status}` });
  const data = await res.json();
  return JSON.stringify(data, null, 2);
}

async function executeGetNodeInfo(args: Record<string, unknown>): Promise<string> {
  const res = await fetch('/api/node', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodes: args.nodes, property: args.property }),
  });

  if (!res.ok) return JSON.stringify({ error: `API error: ${res.status}` });
  const data = await res.json();
  return JSON.stringify(data, null, 2);
}

async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'get_observations':
      return executeGetObservations(args);
    case 'get_node_info':
      return executeGetNodeInfo(args);
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

// ── Agentic loop ─────────────────────────────────────────────────────────────

const MAX_ITERATIONS = 10;

export async function runAgent(
  apiKey: string,
  model: string,
  history: ChatMessage[],
  userMessage: string,
  onStep: (step: AgentStep) => void,
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  // Build conversation contents for Gemini
  const contents: Content[] = [];
  for (const msg of history) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    });
  }
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  let iterations = 0;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    onStep({ type: 'thinking', content: iterations === 1 ? 'Analyzing your question...' : 'Processing results...' });

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
      },
    });

    const candidate = response.candidates?.[0];
    if (!candidate?.content?.parts) {
      return 'Sorry, I could not generate a response. Please try again.';
    }

    const parts = candidate.content.parts;

    // Check for function calls
    const functionCalls: FunctionCall[] = [];
    let textResponse = '';

    for (const part of parts) {
      if (part.functionCall) {
        functionCalls.push(part.functionCall);
      }
      if (part.text) {
        textResponse += part.text;
      }
    }

    // If there's a text response and no function calls, we're done
    if (textResponse && functionCalls.length === 0) {
      onStep({ type: 'text', content: textResponse });
      return textResponse;
    }

    // Execute function calls
    if (functionCalls.length > 0) {
      // Add model's response (with function calls) to conversation
      contents.push({
        role: 'model',
        parts: parts as Part[],
      });

      const functionResponseParts: Part[] = [];

      for (const fc of functionCalls) {
        const args = (fc.args ?? {}) as Record<string, unknown>;
        onStep({
          type: 'tool_call',
          content: `Calling ${fc.name}`,
          toolName: fc.name,
          toolArgs: args,
        });

        const result = await executeTool(fc.name!, args);

        // Truncate very long results for the UI step
        const displayResult = result.length > 500 ? result.slice(0, 500) + '...' : result;
        onStep({ type: 'tool_result', content: displayResult, toolName: fc.name });

        functionResponseParts.push({
          functionResponse: {
            name: fc.name!,
            response: { result: JSON.parse(result) },
          },
        });
      }

      // Add function responses to conversation
      contents.push({ role: 'user', parts: functionResponseParts });
    }
  }

  return 'I reached the maximum number of steps. Please try a simpler question.';
}
