import { todosTable } from "./db/schema.js";
import { ilike, eq } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";
import readlineSync from "readline-sync";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import { config } from "dotenv";
import { Console } from "console";

config({ path: ".env" });
const { Client } = pkg;

const client = new Client({ connectionString: process.env.POSTGRES_URL });
await client.connect();

const db = drizzle(client);
export default db;

// tools
async function getAllTodos() {
  const todos = await db.select().from(todosTable);
  return todos;
}

async function createTodo(todo) {
  const [res] = await db
    .insert(todosTable)
    .values({ todo })
    .returning({ id: todosTable.id });
  return res.id;
}

async function deleteTodo(id) {
  await db.delete(todosTable).where(eq(todosTable.id, id));
}

async function searchTodo(search) {
  const todos = await db
    .select()
    .from(todosTable)
    .where(ilike(todosTable.todo, `%${search}%`));
  return todos;
}

// agent
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYS_PROMPT = `
You are an AI TODO assistant that can manage tasks by adding, viewing, updating and deleting todos. You follow a strict START, PLAN, ACTION, Observation, and OUTPUT flow to answer user requests.
- **START**: You will be given a user request.
- **PLAN**: Create a step-by-step plan to address the request using the available tools.
- **ACTION**: Execute a step in your plan by calling one of the available functions. You can only call one function at a time.
- **Observation**: After an ACTION, you will receive an observation. This is the result of the function call.
- **Repeat**: You may need to repeat the PLAN -> ACTION -> Observation cycle multiple times.
- **OUTPUT**: When you have the final answer, provide it in the OUTPUT state.

TODO db Schema:
- id: integer, primary key, auto-increment
- todo: string, not null
- created_at: Date time
- updated_at: Date time

Available tools:
- getAllTodos(): returns all todos from the database.
- createTodo(todo: string): creates a new todo in the db and takes todo as a string input. It returns the id of the created todo.
- deleteTodo(id: string): deletes the todo by id given.
- searchTodo(search: string): searches for all todos matching the query string using ilike, and returns a list of todos.

You must strictly follow the JSON format as shown in the examples.
Only use the functions mentioned in the tools section.
Make sure to call one function at a time and wait for the observation before proceeding.

Note if no input is required for a function, pass an empty string
`;

const EXAMPLE_HISTORY = [
  {
    role: "user",
    parts: [
      {
        text: `START\n{"type": "user", "user": "Add a task for shopping Groceries"}`,
      },
    ],
  },
  {
    role: "model",
    parts: [
      {
        text: `{"type": "plan", "plan": "I will try to get more context on what user needs to shop."}\n{"type": "output", "output": "Can u tell me what all items do you want to shop for?"}`,
      },
    ],
  },
  {
    role: "user",
    parts: [
      {
        text: `{"type": "user", "user": "I need to buy milk, eggs, and bread."}`,
      },
    ],
  },
  {
    role: "model",
    parts: [
      {
        text: `{"type": "plan", "plan": "I will use createTodo to create a new todo in DB."}\n{"type": "action", "function": "createTodo", "input": "Shopping for milk, eggs, and bread."}`,
      },
    ],
  },
  {
    role: "user",
    parts: [{ text: `{"type": "observation", "observation": "2"}` }],
  },
  {
    role: "model",
    parts: [
      {
        text: `{"type": "output", "output": "Your todo has been added successfully."}`,
      },
    ],
  },
];

const tools = {
  getAllTodos: getAllTodos,
  createTodo: createTodo,
  deleteTodo: deleteTodo,
  searchTodo: searchTodo,
};

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
  systemInstruction: SYS_PROMPT,
});

const chat = model.startChat({
  history: EXAMPLE_HISTORY,
});

console.log(
  "🤖 AI Agent Initialized. Ask me anything! (type 'exit' to quit)\n"
);

while (true) {
  const userInput = readlineSync.question(">> ");
  if (userInput.toLowerCase() === "exit") {
    console.log("🤖 Goodbye!");
    await client.end();
    break;
  }

  let nextPrompt = `START\n${JSON.stringify({
    type: "user",
    user: userInput,
  })}`;
  let isDone = false;

  while (!isDone) {
    const result = await chat.sendMessage(nextPrompt);
    const response = result.response;
    let responseText = response.text();
    const jsonResponses = responseText.trim().match(/\{[\s\S]*?\}/g);

    console.log("\n------------------- Response ------------------");
    console.log(`${responseText}`);
    console.log("------------------- Response ------------------\n");

    // Parse the last valid JSON object from the response.
    const call = JSON.parse(jsonResponses[jsonResponses.length - 1]);

    if (call.type === "output") {
      console.log("🤖: ", call.output, "\n");
      isDone = true;
    } else if (call.type === "action") {
      const fn = tools[call.function];
      if (fn) {
        if (call.input === "") {
          call.input = {};
        }
        const observation = await fn(call.input);
        nextPrompt = JSON.stringify({
          type: "observation",
          observation: observation,
        });
        // console.log(`[Observation] ${observation}`);
      } else {
        console.error(`Error: invalid tool call`);
        isDone = true;
      }
    } else if (call.type === "plan") {
      // we let it continue by feeding the plan back to it.
      nextPrompt = responseText;
    } else {
      console.warn(`Warning: Model returned an unhandled type: "${call.type}"`);
      isDone = true;
    }
  }
}
