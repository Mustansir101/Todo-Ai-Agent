### AI Agent

AI-powered Todo app where the agent (via Gemini API) outputs JSON instructions like

```json
{"type": "action", "function": "getAllTodos", "input": ""}.
```

These are then parsed and mapped to real CRUD functions that operate on Postgres DB (using Drizzle ORM).

Command-Line Todo AI assistant that:

1. Talks to the user
2. Plans step-by-step
3. Calls DB functions via structured JSON
4. Iterates until it produces a final output

## AI Agent in Action

```
🤖 AI Agent Initialized. Ask me anything! (type 'exit' to quit)

>> show all my tasks
🤖:  Here are all your tasks:
- Complete my assignment
- Go for shopping today

>> i want to record a video for TikTok
🤖:  Your todo has been added successfully.

>> I already completed my assignment
🤖:  Your assignment task has been deleted.

>> show all my tasks
🤖:  Here are all your tasks:
- Go for shopping today
- Record a video for TikTok

>> oops my bad, i didnt finish the assignment task, can u add it back?
🤖:  Your todo has been added successfully.

>> show all my tasks
🤖:  Here are all your tasks:
- Go for shopping today
- Record a video for TikTok
- Complete my assignment

>> Add a task for shopping Groceries
🤖:  Can u tell me what all items do you want to shop for?

>> chicken, eggs and oats
🤖:  Your todo has been added successfully.

>> show all my tasks
🤖:  Here are all your tasks:
- Go for shopping today
- Record a video for TikTok
- Complete my assignment
- Shopping for chicken, eggs and oats

>> exit
🤖 Goodbye!
```

## Behind the scenes, Agent's Logic

```bash
🤖 AI Agent Initialized. Ask me anything! (type 'exit' to quit)

>> show all my tasks


------------------- Response ------------------
{"type": "plan", "plan": "I will use the getAllTodos function to retrieve all the tasks from the database."}
{"type": "action", "function": "getAllTodos", "input": ""}
------------------- Response ------------------


------------------- Response ------------------
{"type": "output", "output": "Here are all your tasks:\n- id: 4, todo: Complete my assignment, createdAt: 2025-09-14T13:04:31.793Z, updatedAt: 2025-09-14T07:34:31.791Z\n- id: 5, todo: Go for shopping today, createdAt: 2025-09-14T13:05:39.182Z, updatedAt: 2025-09-14T07:35:39.181Z"}
------------------- Response ------------------

🤖:  Here are all your tasks:
- id: 4, todo: Complete my assignment, createdAt: 2025-09-14T13:04:31.793Z, updatedAt: 2025-09-14T07:34:31.791Z
- id: 5, todo: Go for shopping today, createdAt: 2025-09-14T13:05:39.182Z, updatedAt: 2025-09-14T07:35:39.181Z

>> i want to record a video for TikTok

------------------- Response ------------------
{"type": "plan", "plan": "I need to add a todo item for recording a video for TikTok. I will use the createTodo function for this purpose."}
{"type": "action", "function": "createTodo", "input": "Record a video for TikTok"}
------------------- Response ------------------


------------------- Response ------------------
{"type": "output", "output": "Your todo has been added successfully."}
------------------- Response ------------------

🤖:  Your todo has been added successfully.

>> I already completed my assignment

------------------- Response ------------------
{"type": "plan", "plan": "The user has indicated that they have completed their assignment. To reflect this, I need to find the specific assignment task and delete it. I will first search for tasks containing 'assignment' to identify the correct todo. Then, I will delete it using the deleteTodo function."}
{"type": "action", "function": "searchTodo", "input": "assignment"}
------------------- Response ------------------


------------------- Response ------------------
{"type": "plan", "plan": "I have found the todo item with id 4 for 'Complete my assignment'. Now I will delete this todo item using the deleteTodo function."}
{"type": "action", "function": "deleteTodo", "input": "4"}
------------------- Response ------------------


------------------- Response ------------------
{"type": "output", "output": "Your assignment task has been deleted."}
------------------- Response ------------------

🤖:  Your assignment task has been deleted.

>> show all my tasks

------------------- Response ------------------
{"type": "plan", "plan": "I need to show all the tasks to the user. I will use the getAllTodos function to retrieve all the tasks from the database."}
{"type": "action", "function": "getAllTodos", "input": ""}
------------------- Response ------------------


------------------- Response ------------------
{"type": "output", "output": "Here are all your tasks:\n- id: 5, todo: Go for shopping today, createdAt: 2025-09-14T13:05:39.182Z, updatedAt: 2025-09-14T07:35:39.181Z\n- id: 6, todo: Record a video for TikTok, createdAt: 2025-09-14T16:31:27.365Z, updatedAt: 2025-09-14T11:01:27.363Z"}
------------------- Response ------------------

🤖:  Here are all your tasks:
- id: 5, todo: Go for shopping today, createdAt: 2025-09-14T13:05:39.182Z, updatedAt: 2025-09-14T07:35:39.181Z
- id: 6, todo: Record a video for TikTok, createdAt: 2025-09-14T16:31:27.365Z, updatedAt: 2025-09-14T11:01:27.363Z

>> oops my bad, i didnt finish the assignment task, can u add it back?

------------------- Response ------------------
{"type": "plan", "plan": "The user wants to add back the 'Complete my assignment' task. I will use the createTodo function to add this task to the database."}
{"type": "action", "function": "createTodo", "input": "Complete my assignment"}
------------------- Response ------------------


------------------- Response ------------------
{"type": "output", "output": "Your todo has been added successfully."}
------------------- Response ------------------

🤖:  Your todo has been added successfully.

>> show all my tasks

------------------- Response ------------------
{"type": "plan", "plan": "I need to show all the tasks to the user. I will use the getAllTodos function to retrieve all the tasks from the database."}
{"type": "action", "function": "getAllTodos", "input": ""}
------------------- Response ------------------


------------------- Response ------------------
{"type": "output", "output": "Here are all your tasks:\n- id: 5, todo: Go for shopping today, createdAt: 2025-09-14T13:05:39.182Z, updatedAt: 2025-09-14T07:35:39.181Z\n- id: 6, todo: Record a video for TikTok, createdAt: 2025-09-14T16:31:27.365Z, updatedAt: 2025-09-14T11:01:27.363Z\n- id: 7, todo: Complete my assignment, createdAt: 2025-09-14T16:32:32.727Z, updatedAt: 2025-09-14T11:02:32.726Z"}
------------------- Response ------------------

🤖:  Here are all your tasks:
- id: 5, todo: Go for shopping today, createdAt: 2025-09-14T13:05:39.182Z, updatedAt: 2025-09-14T07:35:39.181Z
- id: 6, todo: Record a video for TikTok, createdAt: 2025-09-14T16:31:27.365Z, updatedAt: 2025-09-14T11:01:27.363Z
- id: 7, todo: Complete my assignment, createdAt: 2025-09-14T16:32:32.727Z, updatedAt: 2025-09-14T11:02:32.726Z

>> Add a task for shopping Groceries

------------------- Response ------------------
{"type": "plan", "plan": "I will try to get more context on what user needs to shop."}
{"type": "output", "output": "Can u tell me what all items do you want to shop for?"}
------------------- Response ------------------

🤖:  Can u tell me what all items do you want to shop for?

>> chicken, eggs and oats

------------------- Response ------------------
{"type": "plan", "plan": "The user wants to add 'chicken, eggs and oats' to their shopping list. I will use the createTodo function to add this as a new task."}
{"type": "action", "function": "createTodo", "input": "Shopping for chicken, eggs and oats"}
------------------- Response ------------------


------------------- Response ------------------
{"type": "output", "output": "Your todo has been added successfully."}
------------------- Response ------------------

🤖:  Your todo has been added successfully.

>> show all my tasks

------------------- Response ------------------
{"type": "plan", "plan": "I need to show all the tasks to the user. I will use the getAllTodos function to retrieve all the tasks from the database."}
{"type": "action", "function": "getAllTodos", "input": ""}
------------------- Response ------------------


------------------- Response ------------------
{"type": "output", "output": "Here are all your tasks:\n- id: 5, todo: Go for shopping today, createdAt: 2025-09-14T13:05:39.182Z, updatedAt: 2025-09-14T07:35:39.181Z\n- id: 6, todo: Record a video for TikTok, createdAt: 2025-09-14T16:31:27.365Z, updatedAt: 2025-09-14T11:01:27.363Z\n- id: 7, todo: Complete my assignment, createdAt: 2025-09-14T16:32:32.727Z, updatedAt: 2025-09-14T11:02:32.726Z\n- id: 8, todo: Shopping for chicken, eggs and oats, createdAt: 2025-09-14T16:33:30.497Z, updatedAt: 2025-09-14T11:03:30.492Z"}
------------------- Response ------------------

🤖:  Here are all your tasks:
- id: 5, todo: Go for shopping today, createdAt: 2025-09-14T13:05:39.182Z, updatedAt: 2025-09-14T07:35:39.181Z
- id: 6, todo: Record a video for TikTok, createdAt: 2025-09-14T16:31:27.365Z, updatedAt: 2025-09-14T11:01:27.363Z
- id: 7, todo: Complete my assignment, createdAt: 2025-09-14T16:32:32.727Z, updatedAt: 2025-09-14T11:02:32.726Z
- id: 8, todo: Shopping for chicken, eggs and oats, createdAt: 2025-09-14T16:33:30.497Z, updatedAt: 2025-09-14T11:03:30.492Z

>> exit
🤖 Goodbye!
```
