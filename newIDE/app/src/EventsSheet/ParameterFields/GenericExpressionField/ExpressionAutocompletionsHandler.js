// @flow
import { type ExpressionAutocompletion } from '../../../ExpressionAutocompletion';

export type AutocompletionsState = {|
  autocompletions: Array<ExpressionAutocompletion>,
  selectedCompletionIndex: number,
|};

export const getAutocompletionsInitialState = (): AutocompletionsState => {
  return {
    autocompletions: [],
    selectedCompletionIndex: 0,
  };
};

const MAX_VISIBLE_COUNT = 25;

export const getRemainingCount = (state: AutocompletionsState): number => {
  return Math.max(0, state.autocompletions.length - MAX_VISIBLE_COUNT);
};

export const getVisibleAutocompletions = (
  state: AutocompletionsState
): Array<ExpressionAutocompletion> => {
  const remainingCount = getRemainingCount(state);
  return remainingCount === 0
    ? state.autocompletions
    : state.autocompletions.slice(0, MAX_VISIBLE_COUNT);
};

export const setNewAutocompletions = (
  state: AutocompletionsState,
  autocompletions: Array<ExpressionAutocompletion>
): AutocompletionsState => {
  const completionsChanged =
    state.autocompletions.length !== autocompletions.length;

  // Reset the selected completion only if completions changed.
  const selectedCompletionIndex = completionsChanged
    ? 0
    : state.selectedCompletionIndex;

  return {
    autocompletions,
    selectedCompletionIndex,
  };
};

export const handleAutocompletionsKeyDown = (
  state: AutocompletionsState,
  {
    event,
    onUpdateAutocompletions,
  }: {| event: SyntheticKeyboardEvent<>, onUpdateAutocompletions: () => void |}
): AutocompletionsState => {
  if (
    event.key === 'ArrowDown' ||
    event.key === 'ArrowUp' ||
    event.key === 'ArrowLeft' ||
    event.key === 'ArrowRight'
  ) {
    onUpdateAutocompletions();
  }

  if (!state.autocompletions.length) return state;

  const visibleAutocompletionsLength = Math.min(
    MAX_VISIBLE_COUNT,
    state.autocompletions.length
  );

  if (event.key === 'ArrowDown') {
    event.preventDefault();

    return {
      ...state,
      selectedCompletionIndex:
        (state.selectedCompletionIndex + 1) % visibleAutocompletionsLength,
    };
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();

    return {
      ...state,
      selectedCompletionIndex:
        (visibleAutocompletionsLength + state.selectedCompletionIndex - 1) %
        visibleAutocompletionsLength,
    };
  } else if (event.key === 'Escape') {
    // Stop propagation to avoid closing the modal the
    // field is contained in.
    event.preventDefault();
    event.stopPropagation();
  }

  return state;
};

export const handleAutocompletionsKeyUp = (
  state: AutocompletionsState,
  { event }: {| event: SyntheticKeyboardEvent<> |}
): AutocompletionsState => {
  if (!state.autocompletions.length) return state;

  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();

    return getAutocompletionsInitialState();
  }

  return state;
};

export const handleAutocompletionsKeyPress = (
  state: AutocompletionsState,
  {
    event,
    onInsertAutocompletion,
  }: {|
    event: SyntheticKeyboardEvent<>,
    onInsertAutocompletion: ExpressionAutocompletion => void,
  |}
): AutocompletionsState => {
  if (!state.autocompletions.length) return state;

  if (event.key === 'Enter') {
    const autocompletion = state.autocompletions[state.selectedCompletionIndex];
    if (autocompletion) onInsertAutocompletion(autocompletion);
    event.preventDefault();
  } else if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
  }

  return state;
};
