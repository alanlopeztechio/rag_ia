'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Chat from '@/components/ia/chat';

export default function Home() {
  const todos = useQuery(api.todos.list);
  const createTodo = useMutation(api.todos.create);
  const toggleComplete = useMutation(api.todos.toggleComplete);
  const deleteTodo = useMutation(api.todos.deleteTodo);
  const updateTodo = useMutation(api.todos.update);

  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      await createTodo({ text: inputValue });
      setInputValue('');
    }
  };

  const handleToggle = async (id: string) => {
    await toggleComplete({ id: id as any });
  };

  const handleDelete = async (id: string) => {
    await deleteTodo({ id: id as any });
  };

  const handleStartEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  const handleSaveEdit = async () => {
    if (editingId && editingText.trim()) {
      await updateTodo({ id: editingId as any, text: editingText });
      setEditingId(null);
      setEditingText('');
    }
  };

  const completedCount = todos?.filter((t) => t.completed).length || 0;
  const totalCount = todos?.length || 0;

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-background border border-foreground/10 rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            My Todo List
          </h1>
          <p className="text-foreground/70 mb-6">
            {completedCount} of {totalCount} tasks completed
          </p>

          <form onSubmit={handleAddTodo} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Add a new task..."
                className="flex-1 px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground bg-background placeholder-foreground/50"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                Add
              </button>
            </div>
          </form>

          <div className="space-y-2">
            {!todos ? (
              <p className="text-foreground/60 text-center py-8">
                Loading tasks...
              </p>
            ) : todos.length === 0 ? (
              <p className="text-foreground/60 text-center py-8">
                No tasks yet. Add one to get started!
              </p>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo._id}
                  className="flex items-center gap-3 p-4 bg-background/50 border border-foreground/10 rounded-lg hover:bg-background/70 transition-colors group"
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggle(todo._id)}
                    className="w-5 h-5 text-blue-500 cursor-pointer"
                  />
                  {editingId === todo._id ? (
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      autoFocus
                      className="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none text-foreground bg-background"
                    />
                  ) : (
                    <span
                      onClick={() => handleStartEdit(todo._id, todo.text)}
                      className={`flex-1 cursor-pointer ${
                        todo.completed
                          ? 'line-through text-foreground/50'
                          : 'text-foreground'
                      }`}
                    >
                      {todo.text}
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(todo._id)}
                    className="opacity-0 group-hover:opacity-100 px-3 py-1 text-red-500 hover:bg-red-500/10 rounded transition-all"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        <Chat />
      </div>
    </main>
  );
}
