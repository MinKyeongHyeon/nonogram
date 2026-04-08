
import { fetchPuzzles, fetchPuzzleById } from './puzzles';

describe('Puzzle Data and Fetching', () => {
  it('should fetch all 55 puzzles', async () => {
    const puzzles = await fetchPuzzles();
    expect(puzzles.length).toBe(55);
  });

  it('should have all necessary fields after dynamic completion', async () => {
    const puzzles = await fetchPuzzles();
    const firstPuzzle = puzzles[0];
    
    expect(firstPuzzle).toHaveProperty('id');
    expect(firstPuzzle).toHaveProperty('name');
    expect(firstPuzzle).toHaveProperty('solution');
    expect(firstPuzzle).toHaveProperty('rows');
    expect(firstPuzzle).toHaveProperty('cols');
    expect(firstPuzzle).toHaveProperty('clues');
    
    // Check specific values for the first puzzle (십자가)
    expect(firstPuzzle.rows).toBe(5);
    expect(firstPuzzle.cols).toBe(5);
    expect(firstPuzzle.clues.rows).toEqual([[1], [1], [5], [1], [1]]);
  });

  it('should fetch a specific puzzle by ID correctly', async () => {
    const puzzle = await fetchPuzzleById(6); // First Alphabet puzzle (A)
    expect(puzzle).not.toBeNull();
    expect(puzzle?.name).toBe('Alphabet - A');
    expect(puzzle?.rows).toBe(5);
    expect(puzzle?.clues.rows).toEqual([[3], [1, 1], [5], [1, 1], [1, 1]]);
  });

  it('should return null for non-existent puzzle ID', async () => {
    const puzzle = await fetchPuzzleById(999);
    expect(puzzle).toBeNull();
  });
});
