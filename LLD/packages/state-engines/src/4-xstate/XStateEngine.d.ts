import type { AppState, Theme, Todo } from "../types";
export declare const appMachine: import("xstate").StateMachine<{
    theme: Theme;
    user: import("..").AppUser | null;
    todos: Todo[];
    isLoadingTodos: boolean;
}, import("xstate").AnyEventObject, Record<string, import("xstate").AnyActorRef>, import("xstate").ProvidedActor, import("xstate").ParameterizedObject, import("xstate").ParameterizedObject, string, import("xstate").StateValue, string, unknown, import("xstate").NonReducibleUnknown, import("xstate").EventObject, import("xstate").MetaObject, any>;
export declare const useXStateEngine: () => AppState;
