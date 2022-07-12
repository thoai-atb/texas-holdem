import { useRef } from "react";

/**
 * `useDetechChange` returns boolean value of whether or not one of the element inside `values` changes.
 * This hook is useful when we want to execute a function when only some of the useEffect's dependencies change.
 * Example use:
 * a) Declare `const idChanged = useDetectChange([id])`.
 * b) Use it as a condition: `useEffect(() => {if(idChanged) loadData(id)}, [idChanged, id, loadData])`.
 * This hook solves the problem if loadData is constantly changing and we only want to execute it when id changes.
 * @param values an array of values to be detected
 * @returns true if one of the declared values changes from the last render, otherwise false.
 */
export function useDetectChange(values) {
  const ref = useRef([]);
  let changed = values.length !== ref.current.length;
  if (!changed)
    for (let i = 0; i < values.length; i++) {
      if (ref.current[i] !== values[i]) {
        changed = true;
        break;
      }
    }
  ref.current = values;
  console.log("changed: ", changed);
  return changed;
}
