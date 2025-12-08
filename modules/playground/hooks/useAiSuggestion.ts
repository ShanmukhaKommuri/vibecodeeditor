import { currentuser } from '@/modules/auth/actions';
import { previousDay } from 'date-fns';
import { useCallback, useState } from 'react'
import { set } from 'zod';


interface AiSuggestionsState {
    suggestion: string | null;
    isLoading: boolean;
    position: {
        line: number;
        column: number;
    } | null
    decoration: string[];
    isEnabled: boolean;
}

interface UseAiSuggestionsReturn extends AiSuggestionsState {
    toggleEnabled: () => void;
    fetchSuggestion: (type: string, editor: any) => Promise<void>;
    acceptSuggestion: (editor: any, monaco: any) => void;
    rejectSuggestion: (editor: any) => void;
    clearSuggestion: (editor: any) => void;
}

export const useAiSuggestions = (): UseAiSuggestionsReturn => {
    const [state, setState] = useState<AiSuggestionsState>({
        suggestion: null,
        isLoading: false,
        position: null,
        decoration: [],
        isEnabled: true
    });

    const toggleEnabled = useCallback(() => {
        setState((prev) => {
            return { ...prev, isEnabled: !prev.isEnabled }
        })
    }, [])
    const fetchSuggestion = useCallback(async (type: string, editor: any) => {//type argument is what type of suggestion method suggestion or code some program
        setState((currentState) => {
            if (!currentState.isEnabled) return currentState;

            if (!editor) {
                return currentState;
            }

            const model = editor.getModel();

            const cursorPosition = editor.getPosition();
            console.log(cursorPosition);

            if (!model || !cursorPosition) {
                return currentState
            }

            const newState = { ...currentState, isLoading: true };

            (async () => {
                try {
                    const payload = {
                        fileContent: model.getValue(),
                        cursorLine: cursorPosition.lineNumber - 1,
                        cursorColumn: cursorPosition.column - 1,
                        suggestionType: type,
                    }

                    const response = await fetch("/api/code-completion", {
                        method: "POST",
                        headers: {
                            "Content-type": "application/json",
                        },
                        body: JSON.stringify(payload),
                    })
                    if (!response.ok) {
                        throw new Error(`API responds json() : ${response.status}`)
                    }

                    const data = await response.json();

                    if (data.suggestion) {
                        console.log("suggestion received : ", data)
                        const suggestionText = data.suggestion.trim();
                        setState((prev) => ({
                            ...prev,
                            suggestion: suggestionText,
                            position: {
                                line: cursorPosition.lineNumber,
                                column: cursorPosition.column
                            },
                            isLoading: false,
                        }))
                    }
                    else {
                        console.warn("No suggestion received from API")
                        setState((prev) => {
                            return {
                                ...prev,
                                isLoading: false,
                            }
                        })
                    }
                } catch (error) {
                    console.log("Error fetching code suggestion : ", error);
                    setState((prev) => ({
                        ...prev, isLoading: false
                    }));
                }
            })();

            return newState;


        })
    }, [])

    const acceptSuggestion = useCallback((editor: any, monaco: any) => {
        setState((currentState) => {
            if (!currentState.suggestion || !currentState.position || !editor || !monaco) return currentState;

            const { line, column } = currentState.position;
            const sanitizedSuggestion = currentState.suggestion.replace(/^\d+:\s*/gm, "");

            editor.executeEdits("", [{
                range: new monaco.Range(line, column, line, column),
                text: sanitizedSuggestion,
                forceMoveMarkers: true
            }]);

            if (editor && currentState.decoration.length > 0) {
                editor.deltaDecorations(currentState.decoration, [])
            }

            return {
                ...currentState,
                suggestion: null,
                position: null,
                decoration: [],
            }
        })
    }, [])


    const rejectSuggestion = useCallback((editor: any) => {
        setState(
            (currentstate) => {

                if (editor && currentstate.decoration.length > 0) {
                    editor.deltaDecorations(currentstate.decoration, [])
                }

                return {
                    ...currentstate,
                    suggestion: null,
                    position: null,
                    decoration: [],
                }
            }
        )
    }, [])

    const clearSuggestion = useCallback((editor: any) => {
        setState(
            (currentstate) => {

                if (editor && currentstate.decoration.length > 0) {
                    editor.deltaDecorations(currentstate.decoration, [])
                }

                return {
                    ...currentstate,
                    suggestion: null,
                    position: null,
                    decoration: [],
                }
            }
        )
    }, [])

    return {
        ...state,
        toggleEnabled,
        fetchSuggestion,
        acceptSuggestion,
        rejectSuggestion,
        clearSuggestion

    }
}