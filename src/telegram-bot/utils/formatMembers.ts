import { Member } from "data/entity";

export default function(members: Member[]): string {
    return "Members: " + members
        .map(m => m.name)
        .sort((left, right) => left.localeCompare(right))
        .join(", ");
}