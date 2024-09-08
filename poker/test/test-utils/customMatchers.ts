import {MatcherCreator, Matcher} from 'jest-mock-extended';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sameArray: MatcherCreator<any[]> = function (expected) {
  return new Matcher(actual => {
    if (expected.length !== actual.length) {
      return false;
    }

    const sortedExpected = expected.sort();
    const sortedActual = actual.sort();

    for (let i = 0; i < expected.length; i++) {
      if (sortedExpected[i] !== sortedActual[i]) {
        return false;
      }
    }

    return true;
  }, 'sameArray()');
};

export const sameObject: MatcherCreator<object> = function (expected) {
  return new Matcher(actual => {
    const expectedEntries = Object.entries(expected);
    const actualEntries = Object.entries(actual);

    if (expectedEntries.length !== actualEntries.length) {
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type Entry = [string, any];
    type EntryComparator = (left: Entry, right: Entry) => number;
    const entryComparator: EntryComparator = ([keyLeft], [keyRight]) =>
      keyLeft.localeCompare(keyRight);

    const sortedExpectedEntries = expectedEntries.sort(entryComparator);
    const sortedActualEntries = actualEntries.sort(entryComparator);

    for (let i = 0; i < expectedEntries.length; i++) {
      if (
        sortedExpectedEntries[i][0] !== sortedActualEntries[i][0] ||
        sortedExpectedEntries[i][1] !== sortedActualEntries[i][1]
      ) {
        return false;
      }
    }

    return true;
  }, 'sameObject()');
};
