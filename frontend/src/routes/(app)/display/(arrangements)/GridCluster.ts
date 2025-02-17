import type { Arrangement, ArrangementState, SquareInfo } from "../arrangement.svelte";

const options = {
    grid_size: { type: "number", label: "grid size", min: 5, max: 100},
    min_size: { type: "number", label: "min size", min: 1, max: 25},
    max_size: { type: "number", label: "max size", min: 1, max: 25},
} as const;

const state: ArrangementState<typeof options> = {
    grid_size: 50,
    min_size: 5,
    max_size: 15
} as const;

function generate(n_s: number | null, s: ArrangementState<typeof options>) {
    // initialize number of squares if not specified
    const num_squares = n_s ?? Math.floor((s.grid_size / (s.max_size - s.min_size)) ** 2);

    // generate a list of random sizes and initialize the grid
    const sizes = generateSizes(num_squares, s.min_size, s.max_size);
    const grid = initializeGrid(s.grid_size);

    // initialize a list of squares, recording the position and size of successful places
    const grid_squares: SquareInfo[] = [];

    // place squares until there are no more to be placed
    while (sizes.length > 0) {
        const size = sizes.pop()!;

        // initialize the candidate position and its distance to center
        let bestSq: SquareInfo = {size, x: 0, y: 0}
        let minDistSq = Number.MAX_SAFE_INTEGER;
        let foundPosition = false;

        // iterate through every possible position
        for (let i = 0; i < s.grid_size; i++) {
            for (let j = 0; j < s.grid_size; j++) {
                const newSq = {size, x: j, y: i}

                // make sure the square doesn't overlap
                if (checkCollisions(grid, newSq)) {
                    // announce that we found a valid position
                    foundPosition = true;

                    // find the distance of the new square to the center
                    const ctrX = newSq.x + newSq.size / 2;
                    const ctrY = newSq.y + newSq.size / 2;
                    let distSq = (ctrX - s.grid_size/2) ** 2 + (ctrY - s.grid_size/2) ** 2

                    // add a random modifier to the distance
                    distSq += Math.floor(Math.random() * newSq.size / 2);

                    // if the distance is closer than the minimum distance,
                    // make this position the new candidate position
                    if (distSq < minDistSq) {
                        bestSq = newSq;
                        minDistSq = distSq;
                    }
                }
            }
        }

        if (foundPosition) {
            // place a square in the grid and push it to the list of successful places
            placeSquare(grid, bestSq);
            grid_squares.push(bestSq);
        }
    }

    // transform squares from grid coordinates to 0-1 coordinates
    return normalizeSquareCoordinates(grid_squares, s.grid_size);
}

/**
 * generates a random list of sizes sorted from smallest to largest
 * @returns the list of sizes
 */
function generateSizes(num: number, minSize: number, maxSize: number) {
    // populate sizes with random numbers in between range
    const sizes: number[] = []
    for (let i = 0; i < num; i++)
        sizes.push(Math.floor((Math.random() ** 3) * ((maxSize + 1) - minSize)) + minSize);

    return sizes.sort((a, b) => { return a - b; });
}

/**
 * creates a two-dimensional boolean grid of the specified width and height
 * @param size the width of the grid. if the only value provided, it specifies the height as well
 * @param sizeY (optional) the height of the grid
 * @returns the grid
 */
function initializeGrid(size: number, sizeY?: number): boolean[][] {
    if (!sizeY) sizeY = size;
    return new Array(sizeY).fill(false).map(() => new Array(size).fill(false));
}

/**
 * places a square in the grid with the desired position and size. this function does not
 * check to make sure the grid is not already populated at the current position. to do so,
 * use checkCollisions()
 * @param grid the grid to check
 * @param square the square to check
 */
function placeSquare(grid: boolean[][], sq: SquareInfo) {
    // find the width and height of the grid
    const gs = {
        x: grid[0].length,
        y: grid.length
    };

    // make xsure square can fit in grid
    if (sq.x + sq.size > gs.x || sq.y + sq.size > gs.y)
        throw `Square (size ${sq.size}) is too large to fit into grid at position (x: ${sq.x}, y: ${sq.y})`;

    // populate grid
    for (let i = sq.y; i < sq.y+sq.size; i++) {
        for (let j = sq.x; j < sq.x+sq.size; j++) {
            grid[i][j] = true;
        }
    }
}

/**
 * determines if a square with a specific location and size overlaps with any already-placed squares
 * @param grid the grid to check
 * @param xPos the x positon of the desired square
 * @param yPos the y position of the desired square
 * @param size the size of the desired square
 * @returns whether or not a square can be placed
 */
function checkCollisions(grid: boolean[][], sq: SquareInfo) {
    // find the width and height of the grid
    const gs = {
        x: grid[0].length,
        y: grid.length
    };

    // make sure square can fit in grid
    if (sq.x + sq.size > gs.x || sq.y + sq.size > gs.y) return false

    // determine if any cells the square would fill are occupied already
    for (let i = sq.y; i < sq.y+sq.size; i++) {
        for (let j = sq.x; j < sq.x+sq.size; j++) {
            if (grid[i][j] === true) return false;
        }
    }

    return true;
}

function normalizeSquareCoordinates(squares: SquareInfo[], gs: number) {
    // find minimum and maximum coordinate values that squares occupy
    const bounds = { left: gs, right: 0, top: gs, bottom: 0 }
    for (const square of squares) {
        if (square.x < bounds.left) bounds.left = square.x;
        if (square.x + square.size > bounds.right) bounds.right = square.x + square.size;
        if (square.y < bounds.top) bounds.top = square.y;
        if (square.y + square.size > bounds.bottom) bounds.bottom = square.y + square.size;
    }

    // translate coordinate bounds to domain
    const d = (bounds.right - bounds.left > bounds.bottom - bounds.top) ?
        { min: bounds.left, max: bounds.right } :
        { min: bounds.top, max: bounds.bottom };

    // map square coordinates to fill 0-1
    return squares.map((sq) => {
        return {
            x: (sq.x - d.min) / (d.max - d.min),
            y: (sq.y - d.min) / (d.max - d.min),
            size: sq.size / (d.max - d.min)
        }
    });
}

export const GridCluster: Arrangement<typeof options> = {
    options, state, generate
}