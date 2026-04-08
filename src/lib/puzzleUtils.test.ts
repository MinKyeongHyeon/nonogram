import { generateCluesFromSolution } from './puzzleUtils';

describe('puzzleUtils', () => {
  describe('generateCluesFromSolution', () => {
    it('should generate correctly for a simple cross', () => {
      const solution = [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0]
      ];
      
      const clues = generateCluesFromSolution(solution);
      
      expect(clues).toEqual({
        rows: [[1], [3], [1]],
        cols: [[1], [3], [1]]
      });
    });

    it('should generate correctly for multiple unconnected blocks', () => {
      const solution = [
        [1, 0, 1, 0, 1],
        [0, 1, 1, 1, 0],
      ];
      
      const clues = generateCluesFromSolution(solution);
      
      expect(clues).toEqual({
        rows: [[1, 1, 1], [3]],
        cols: [[1], [1], [2], [1], [1]]
      });
    });

    it('should properly handle completely empty rows and columns with [0]', () => {
      const solution = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0]
      ];
      
      const clues = generateCluesFromSolution(solution);
      
      expect(clues).toEqual({
        rows: [[0], [1], [0]],
        cols: [[0], [1], [0]]
      });
    });
  });
});
