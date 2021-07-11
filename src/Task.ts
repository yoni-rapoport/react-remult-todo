import { Field, Entity, IdEntity, Validators, BackendMethod, Context } from "@remult/core";

@Entity({
    key: "tasks",
    allowApiCrud: true
})
export class Task extends IdEntity {
    @Field({
        validate: Validators.required
    })
    title: string = '';
    @Field()
    completed: boolean = false;
    @BackendMethod({ allowed: true })
    static async setAll(completed: boolean, context: Context) {
        for await (const task of context.for(Task).iterate()) {
            task.completed = completed;
            await task.save();
        }
    }
}