# Structural diagrams (systems, process, data, architecture)

Use this table when the question is about **how a system is built or behaves** — entities, steps, messages, layers — not about a dataset.

## Decision table

| The question is about... | Diagram | Notation |
|---|---|---|
| What data is stored and how it relates | Entity-Relationship (ERD) | Crow's foot (practical default) or Chen (academic/original) |
| How data moves and is transformed between processes/stores | Data Flow Diagram (DFD) | Gane–Sarson (boxes/arrows, common) or Yourdon–DeMarco (circles) |
| A sequence of decisions/steps | Flowchart | Standard flowchart shapes (start/end, process, decision) |
| Messages exchanged between actors/components over time | Sequence diagram | UML sequence |
| How an object/entity changes state | State diagram | UML state machine |
| Static structure of classes/types | Class diagram | UML class |
| System architecture at varying zoom levels | C4 model | Context → Container → Component → Code |
| Org/hierarchy | Org chart / tree | Simple tree |
| Timeline of a project | Gantt chart | Gantt |

## Derived principles

1. **A DFD is not a flowchart.** A DFD shows *what data moves where and is transformed by what process* — it has no decision diamonds, no control flow, no "start/end." A flowchart shows *order of execution*. Conflating the two is the single most common structural-diagram error. (DeMarco, *Structured Analysis and System Specification*.)
2. **Pick ERD notation for the audience, not by habit.** Crow's foot (many/one/optional markers on the line) is the practical industry default and reads faster for engineers; Chen's original diamond-relationship notation is more precise for teaching the underlying theory but slower to scan. Default to crow's foot unless the audience is learning relational modeling itself. (Chen, 1976; Vertabelo Academy ERD guide.)
3. **One C4 diagram should answer one zoom-level question, never all of them.** "Show me the whole system" (context), "what are the deployable pieces" (container), "what's inside this piece" (component) are different diagrams for different readers — the classic failure is one diagram trying to be all three and satisfying none. (Simon Brown, c4model.com.)
4. **Sequence diagrams are for *interaction over time between named participants*; state diagrams are for *what one thing can become*.** If the diagram needs both an actor axis and a time axis, it's a sequence diagram. If it needs neither and is really about valid transitions of one entity, it's a state diagram. (Fowler, *UML Distilled*.)
5. **A flowchart with more than ~15 nodes should usually be decomposed into subprocesses**, not compressed — the same "one diagram, one question" discipline C4 enforces for architecture applies to process diagrams too.
6. **Always name the notation in a legend or caption** for ERD/DFD — crow's-foot symbols (one, many, zero-or-one) are the most common thing a reader silently misreads.

## Sources

- Peter Chen, "The Entity-Relationship Model" (1976) — origin of ER modeling.
- Vertabelo Academy ERD guide; Lucidchart ERD guide — practical crow's-foot notation references.
- Tom DeMarco, *Structured Analysis and System Specification* (Yourdon Press, 1978) — DFD origin and Yourdon–DeMarco notation.
- Chris Gane & Trish Sarson — Gane–Sarson DFD notation (structured systems analysis, 1979).
- Simon Brown, C4 model — c4model.com — Context/Container/Component/Code architecture diagrams.
- Martin Fowler, *UML Distilled* (Addison-Wesley) — sequence/state/class diagram conventions.
- uml-diagrams.org — practical UML notation reference.
- Mermaid.js docs (mermaid.js.org) and PlantUML docs — usable as a living taxonomy of renderable diagram *types* and their canonical syntax.
