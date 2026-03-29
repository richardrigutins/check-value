/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const debugMock = jest.fn();
const getInputMock = jest.fn<() => string>();
const setFailedMock = jest.fn();
const setOutputMock = jest.fn();

jest.unstable_mockModule('@actions/core', () => ({
  debug: debugMock,
  getInput: getInputMock,
  setFailed: setFailedMock,
  setOutput: setOutputMock,
}));

const main = await import('../src/main.js');

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set output has-value to true if input has a value', () => {
    getInputMock.mockImplementation((name: string) => {
      if (name === 'input') {
        return 'value';
      }
      return '';
    });

    main.run();

    expect(setOutputMock).toHaveBeenCalledWith('has-value', true);
    expect(setFailedMock).not.toHaveBeenCalled();
  });

  it('should set output has-value to false if input does not have a value', () => {
    getInputMock.mockReturnValueOnce('');

    main.run();

    expect(setOutputMock).toHaveBeenCalledWith('has-value', false);
    expect(setFailedMock).not.toHaveBeenCalled();
  });

  it('should set a failed status if an error is thrown', () => {
    getInputMock.mockImplementation((name: string) => {
      if (name === 'input') {
        throw new Error('Error getting input');
      }
      return '';
    });

    main.run();

    expect(setFailedMock).toHaveBeenCalledWith('Error getting input');
    expect(setOutputMock).not.toHaveBeenCalled();
  });

  it('should set a failed status if an unknown error is thrown', () => {
    getInputMock.mockImplementation((name: string) => {
      if (name === 'input') {
        // eslint-disable-next-line no-throw-literal
        throw 'Unknown error';
      }
      return '';
    });

    main.run();

    expect(setFailedMock).toHaveBeenCalled();
    expect(debugMock).toHaveBeenCalled();
    expect(setOutputMock).not.toHaveBeenCalled();
  });
});
