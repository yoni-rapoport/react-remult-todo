import { Context } from '@remult/core';
import React, { useState } from 'react';
import { Task } from './Task';

const context = new Context();

class App1 extends React.Component<{}, {
    newTask: Task,
    tasks: Task[],
    hideCompleted: boolean
}> {
    constructor(p: {}) {
        super(p);
        this.state = {
            hideCompleted: false,
            newTask: context.for(Task).create(),
            tasks: []
        }
        this.componentDidUpdate = (props, prev) => {
            if (prev.hideCompleted != this.state.hideCompleted)
                this.loadTasks();
        }
    }
    async loadTasks() {
        this.setState({
            tasks: await context.for(Task).find({
                where: task => this.state.hideCompleted ? task.completed.isDifferentFrom(true) : undefined,
                orderBy: task => task.completed
            })
        });
    }
    componentDidMount() {
        this.loadTasks();
    }


    render() {
        const createTask = () => {
            newTask.save().then(
                () => {
                    this.setState({ newTask: context.for(Task).create() });
                    this.loadTasks();
                })
                .catch(() => this.setState({}))
        };



        const deleteTask = (t: Task) => {
            t.delete().then(() => this.loadTasks());
        }
        const setAll = (completed: boolean) => {
            (async () => {
                await Task.setAll(completed);
                this.loadTasks();
            })();
        }
        let newTask = this.state.newTask;
        return (
            <div className="App">
                <input value={newTask.title}
                    onChange={(e) => {
                        newTask.title = e.target.value;
                        this.setState({})
                    }} />
                <span style={{ color: 'red' }}>{newTask._.error}</span>
                <button onClick={createTask}>Create Task</button>
                <p>
                    <input
                        id="hideCompleted"
                        type="checkbox"
                        checked={this.state.hideCompleted}
                        onChange={e => {
                            this.setState({ hideCompleted: e.target.checked });
                        }
                        }
                    />
                    <label htmlFor="hideCompleted">Hide completed</label>
                </p>
                <p>
                    <button onClick={() => setAll(true)}>Set all as completed</button>
                    <button onClick={() => setAll(false)}>Set all as uncompleted</button>
                </p>
                <ul>
                    {this.state.tasks.map(t => (
                        <li key={t.id}>
                            <TaskEditor task={t} />
                            <button onClick={() => deleteTask(t)}>Delete</button>
                        </li>))}
                </ul>
            </div>)

    }
}
export default App1;



const TaskEditor: React.FC<{ task: Task }> = (props) => {
    const [{ task }, setTask] = useState(props);
    const save = () => task.save().then(() => setTask({ task }));
    return <span>
        <input
            checked={task.completed}
            type="checkbox"
            onChange={e => { task.completed = e.target.checked; setTask({ task }) }} />
        <input
            value={task.title}
            onChange={e => { task.title = e.target.value; setTask({ task }) }}
            style={{ textDecoration: task.completed ? 'line-through' : undefined }}
        />
        <button
            onClick={save}
            disabled={!task.wasChanged()}>Save</button>
    </span>
}


