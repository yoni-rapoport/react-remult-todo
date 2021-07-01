import { Field, Entity, IdEntity } from "@remult/core";

@Entity({
    key: "tasks",
    allowApiCrud: true
})
export class Task extends IdEntity {
    @Field()
    title: string = '';
    @Field()
    completed: boolean = false;
}