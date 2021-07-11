import { Context } from '@remult/core';
import React, { useState } from 'react';
import { Task } from './Task';
import { useEffect } from 'react';

const context = new Context();



function App() {
  const [, render] = useState({});
  const [reloadTaskDependency, reloadTasks] = useState({});
  const [tasks, setTasks] = useState([] as Task[]);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [newTask, setNewTask] = useState(() => context.for(Task).create());

  useEffect(() => {
    context.for(Task).find({
      where: task => hideCompleted ? task.completed.isDifferentFrom(true) : undefined,
      orderBy: task => task.completed
    }).then(tasks => {
      setTasks([]);
      setTasks(tasks);
    });
  }, [hideCompleted, reloadTaskDependency]);

  const createTask = () => {
    newTask.save().then(
      () => {
        setNewTask(context.for(Task).create());
        reloadTasks({});
      })
      .catch(() => render({}))
  };



  const deleteTask = (t: Task) => {
    t.delete().then(() => reloadTasks({}));
  }
  const setAll = (completed: boolean) => {
    (async () => {
      await Task.setAll(completed, context);
      reloadTasks({});
    })();
  }

  return (
    <div className="App">
      <input value={newTask.title}
        onChange={(e) => {
          newTask.title = e.target.value;
          render({});
        }} />
      <span style={{ color: 'red' }}>{newTask._.error}</span>
      <button onClick={createTask}>Create Task</button>
      <p>
        <input
          id="hideCompleted"
          type="checkbox"
          checked={hideCompleted}
          onChange={e =>
            setHideCompleted(e.target.checked)
          }
        />
        <label htmlFor="hideCompleted">Hide completed</label>
      </p>
      <p>
        <button onClick={() => setAll(true)}>Set all as completed</button>
        <button onClick={() => setAll(false)}>Set all as uncompleted</button>
      </p>
      <ul>
        {tasks.map(t => (
          <li key={t.id}>
            <TaskEditor task={t} />
            <button onClick={() => deleteTask(t)}>Delete</button>
          </li>))}
      </ul>
    </div>
  );
}

export default App;

type Props = {
  task: Task
};

const TaskEditor: React.FC<Props> = ({ task }) => {
  const [, setState] = useState({});
  const save = () => task.save().then(() => setState({}));
  return <span>
    <input
      checked={task.completed}
      type="checkbox"
      onChange={e => { task.completed = e.target.checked; setState({}) }} />
    <input
      value={task.title}
      onChange={e => { task.title = e.target.value; setState({}) }}
      style={{ textDecoration: task.completed ? 'line-through' : undefined }}
    />
    <button
      onClick={save}
      disabled={!task.wasChanged()}>Save</button>
  </span>
}