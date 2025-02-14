const eps = 0.0001;
function packSquares(values : number[], maxValue : number) {
    const max = Math.sqrt(maxValue);
    const square0Size = Math.sqrt(values[0]) / max;
    const squares = <Square[]>[{ x: 0, y: 0, width: square0Size, height: square0Size }];
    // This is const, but only the ref. We splice the array as we
    // iterate through the data points, thus changing the value.
    const outline = [[0, 0], [square0Size, 0], [square0Size, square0Size], [0, square0Size]];
    // Naming conventions:
    //
    // - v{0,1,2,3}: The four vertices of the square which will be inserted into the result list.
    // - n{1,2,...}: Vertices which are used to calculate the direction.
    // - d{1,2,...}: Normalised vectors in the direction vX -> nY
    values.slice(1).forEach(value => {
        const size = Math.sqrt(value) / max;
        const centroid = polygonCentroid(outline);
        // The closest vertex to that centroid is used as one of the vertices
        // for the current rectangle. Saved as the index into the 'outline'
        // list because we need its neighbours.
        const v0Index = outline.reduce((a, v, i) => distance$1(v, centroid) < distance$1(outline[a], centroid) ? i : a, 0);
        const v0 = outline[v0Index];
        // Now we need to decide into which direction the rectangle grows. We
        // can pick one side arbitrarily towards one of the neighbours of the
        // closest index.
        // The n1 vertex is the /direction/ into which the side grows.
        // We still need to do some vector arithmetic to determine where the
        // actual vertex needs to be.
        const n1Index = (v0Index + 1) % outline.length;
        const n1 = outline[n1Index];
        // The unit vector from v0 in the direction towards n1.
        const d1 = normalize(subtract(n1, v0));
        // The second vertex of the rectangle.
        const v1 = add$2(v0, multiply(d1, [size, size]));
        // The third vertex is from 'v0' along the line towards
        // the other (previous) neighbour. But we may need to invert the direction so
        // that the vector points away from the centroid.
        //
        // We compute the direction, and add that the 'v0'. If the
        // result ends up on the same side of the line between 'v0'
        // and 'v1', it means the point is on the wrong side and we have to
        // invert the direction.
        //
        // In the degenerate case where the direction from v0 to n2 is parallel
        // to d1, rotate the vector 90 degrees to the right. This works because
        // the outline is always counter-clockwise (I think).
        const n2Index = (v0Index - 1 + outline.length) % outline.length;
        const n2 = outline[n2Index];
        // The vector along the line between v0 and v2. We may have to invert
        // it if it is rotated by 180 degrees.
        const d2 = (() => {
            // The unit vector from v0 towards n2.
            const d = normalize(subtract(n2, v0));
            const dot2v = dot2(d, d1);
            if (Math.abs(dot2v) < eps) {
                return d;
            }
            else if (dot2v < 0) {
                return [d[1], -d[0]];
            }
            else {
                return d;
            }
        })();
        // Direction from 'v0' to the centroid.
        const centroidDirection = subtract(centroid, v0);
        // For v2 we have two choices where to go. Use the direction which results in
        // the vertex being outside of the outline.
        const v2_a = add$2(v0, multiply(negate(d2), [size, size]));
        const v2_b = add$2(v0, multiply(d2, [size, size]));
        const d3_fwd = pointIsInside(v2_a, outline);
        const v2 = d3_fwd ? v2_b : v2_a;
        // Push the square into the result list.
        squares.push({
            x: Math.min(Math.min(v0[0], v1[0]), v2[0]),
            y: Math.min(Math.min(v0[1], v1[1]), v2[1]),
            width: size,
            height: size
        });
        // Update the outline. (Not sure why this needs to stay but it doesn't work if I take it out - Ava)
        const v4 = add$2(add$2(v0, subtract(v2, v0)), subtract(v1, v0));
        const toInsert = [distance$1(v2, n2) < eps ? undefined : v2,
            v4,
            distance$1(v1, n1) < eps ? undefined : v1
        ].filter(x => x !== undefined);
        if (!d3_fwd) {
            outline.splice(v0Index + 1, 0, ...toInsert);
        }
        else {
            outline.splice(v0Index, 1, ...toInsert);
        }
    });
    return {
        squares: squares,
        outline: outline
    }
};

// https://en.wikipedia.org/wiki/Centroid#Centroid_of_polygon
function polygonCentroid(vertices : number[][]) {
    const { A, cx, cy } = vertices.reduce(({ A, cx, cy }, [x1, y1], i) => {
        const [x2, y2] = vertices[(i + 1) % vertices.length];
        const f = (x1 * y2 - x2 * y1);
        return {
            A: A + f,
            cx: cx + (x1 + x2) * f,
            cy: cy + (y1 + y2) * f,
        };
    }, { A: 0, cx: 0, cy: 0 });
    return multiply([1 / (6 * 0.5 * A), 1 / (6 * 0.5 * A)], [cx, cy]);
};
function pointIsInside([x, y] : number[], vs : number[][]) {
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const [xi, yi] = vs[i];
        const [xj, yj] = vs[j];
        const intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect)
            inside = !inside;
    }
    return inside;
};
// ----------------------------------------------------------------------------
// Vec2
const distance$1 = ([x1, y1] : number[], [x2, y2] : number[]) => Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
const subtract = (a : number[], b : number[]) => [a[0] - b[0], a[1] - b[1]];
const normalize = ([x, y] : number[]) => {
    let len = x * x + y * y;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
        return [x * len, y * len];
    }
    else {
        return [0, 0];
    }
};
const multiply = (a : number[], b : number[]) => [a[0] * b[0], a[1] * b[1]];
const add$2 = (a : number[], b : number[]) => [a[0] + b[0], a[1] + b[1]];
const dot2 = (a : number[], b : number[]) => a[0] * b[0] + a[1] * b[1];
const negate = (a : number[]) => [-a[0], -a[1]];
const min2 = (a : number[], b : number[]) => [Math.min(a[0], b[0]), Math.min(a[1], b[1])];
const max2 = (a : number[], b : number[]) => [Math.max(a[0], b[0]), Math.max(a[1], b[1])];


/* -------------- Ava's functions start here ---------------- */

type Square = {
    x: number;
    y: number;
    width: number;
    height: number;
}

type Point = {
    x: number;
    y: number;
}

type PointPair = {
    left: Point;
    right: Point;
}

// Generate a number of squares to be arranged
 function genNums(min  : number, max  : number, numGen  : number) {
    var results = [];
    for (var i = 0; i < numGen; i++) {
        var value = Math.floor(Math.random() * max + min);
        results.push(value);
    }

    results.sort(function(a, b){return b-a});
    return results;
}

// Generate an arrangment of squares
function genSquares(min_size : number, max_size : number, n_squares : number) {
    var data = genNums(min_size, max_size, n_squares);
    // console.log("Numbers generated: " + data);
    var result = packSquares(data, Math.max.apply(Math, data));
    var outline = result.outline.concat([result.outline[0], result.outline[1], result.outline[2]]);

    var condensedOutline = condenseOutline(outline);
    const longestX = findLongestEdge(condensedOutline, "x");
    const longestY = findLongestEdge(condensedOutline, "y");
    const longestEdge = (longestX.length > longestY.length) ? longestX : longestY;
    // var scaledX = longestEdge.point[0] * scale;
    // var scaledY = longestEdge.point[1] * scale;
    // var scaledLen = longestEdge.length * scale;
    // console.log("Longest edge is on axis: " + longestEdge.axis);
    // console.log("Sample point at " + scaledX + ", " + scaledY);

    return {
        result: result,
        squares: result.squares,
        outline: condensedOutline,
        longestEdge: longestEdge,
        point: [longestEdge.point[0], longestEdge.point[1]],
        len: longestEdge.length
    }
}

// Generate an axis and offset to place arrangments next to one another
function genPositions(max_offset : number, min_offset : number) {
    var axis = Math.round(Math.random());
    var offset_direction = Math.random() < 0.5 ? -1 : 1;
    var offset = (Math.random() * max_offset + min_offset) * offset_direction;
    return [axis, offset];
}

// Find the longest edge on an axis for a given outline
function findLongestEdge(outline : number[][], axis_label : string) {
    var maxLen = 0;
    var tempLen = 0;
    var samplePoint = [0,0];
    var axis = (axis_label == "x") ? 0 : 1;
    for(var i = 0; i < outline.length - 1; i++){
        var current = outline[i];
        var next = outline[(i + 1)];
        //Check if the axis has changed, if not, line is still going
        if (current[1 - axis] == next[1 - axis]){
            tempLen += Math.abs(current[axis] - next[axis]);
        } else {
            if (tempLen >= maxLen) {
                maxLen = tempLen;
                samplePoint = current;
            }
            tempLen = 0;
        }
    }
    return {
        axis: axis,
        length: maxLen,
        point: samplePoint
    }
}

// Take an outline made from points and combine any that are part of the same line
function condenseOutline(outline : number[][]) {
    if(outline.length < 3){
        return outline;
    }

    for(var i = 1; i < outline.length - 1; i++){
        var prev = outline[(i - 1)];
        var current = outline[i];
        var next = outline[(i + 1)];
        var xMatch = current[0] == next[0] && next[0] == prev[0];
        var yMatch = current[1] == next[1] && next[1] == prev[1];
        if (xMatch || yMatch){
            outline.splice(i, 1);
        }
    }
    return outline;
}

// Rotate an arrangment by 90 deg
function rotate(squares : Square[]) {
    for(var i = 0; i < squares.length; i++){
        var temp_x = squares[i].x;
        squares[i].x =  (-1 * squares[i].y) - (squares[i].width);
        squares[i].y = temp_x;
    }
    return squares;
}

// Mirror an arrangment along a given axis
function mirror(squares : Square[], axis : number, sample_point : number[]) {
    for(var i = 0; i < squares.length; i++){
        var origin = sample_point[1 - axis];
        if (axis == 0) { //If we are rotating around the x axis, change y-values
            var new_y = ((squares[i].y - origin) * -1) - squares[i].height;
            squares[i].y = new_y;
        }else{ //If we are rotating around the y axis, change x-values
            var new_x = ((squares[i].x - origin) * -1) - squares[i].width;
            squares[i].x = new_x;
        }
    }
    return squares;
}

// Shift the origins of all squares in an array to new_x and new_y
function shiftOrigin(squares : Square[], new_x : number, new_y : number) {
    for(var i = 0; i < squares.length; i++){
        squares[i].x += new_x;
        squares[i].y += new_y;
    }
    return squares;
}

// Check if a point is within a square
function pointIn(sqr : PointPair, point : Point){
    // Between is just "low < mid < top" in javascript
    const between = (low : number, mid : number, top : number) => ((low < mid) && (mid < top));

    // If both x and y values of the point are within the x and y bounds of the sqr, there is overlap
    var overlap = between(sqr.left.x, point.x, sqr.right.x) && between(sqr.left.y, point.y, sqr.right.y);
    
    // Debugging logs:
    // if (overlap) {
    //     console.log("X point " + point.x + " is between " + sqr.left.x + " and " + sqr.right.x);
    //     console.log("Y point " + point.y + " is between " + sqr.left.y + " and " + sqr.right.y);
    // }
    return overlap;
}

// Check if two squares overlap
function overlap(s1 : Square, s2 : Square) : Boolean{
    // Note: I am fully aware this is not the most efficent approach. 
    // The more efficent approaches straight up didn't work
    const int = (num : number) => (Math.round(num * 10000)); // Drop trailing decimals

    // Get and store top left and bottom right (x,y) points for first square
    var top_left: Point = {x:int(s1.x), y:int(s1.y)};
    var bot_right: Point = {x:int(s1.x + s1.width), y:int(s1.y + s1.height)};
    var sqr: PointPair = {left: top_left, right: bot_right};

    // Get all 4 verticies of second square
    var p1: Point = {x:int(s2.x), y:int(s2.y)};
    var p2: Point = {x:int(s2.x + s2.width), y:int(s2.y)};
    var p3: Point = {x:int(s2.x + s2.width), y:int(s2.y + s2.height)};  
    var p4: Point = {x:int(s2.x), y:int(s2.y + s2.height)};  
    
    // Get 4 midpoints of second square
    // Yes this is not efficent but it's the only way to solve an edge case
    var mp1: Point = {x:int(s2.x + (s2.width / 2)), y:int(s2.y)};
    var mp2: Point = {x:int(s2.x + s2.width), y:int(s2.y + (s2.height / 2))};
    var mp3: Point = {x:int(s2.x + (s2.width / 2)), y:int(s2.y + s2.height)};  
    var mp4: Point = {x:int(s2.x), y:int(s2.y + (s2.height / 2))};  

    // Check if all points in square 2 are within square 1
    var p1_overlap = pointIn(sqr, p1);
    var p2_overlap = pointIn(sqr, p2);
    var p3_overlap = pointIn(sqr, p3);
    var p4_overlap = pointIn(sqr, p4);
    var mp1_overlap = pointIn(sqr, mp1);
    var mp2_overlap = pointIn(sqr, mp2);
    var mp3_overlap = pointIn(sqr, mp3);
    var mp4_overlap = pointIn(sqr, mp4);

    var all_overlap = p1_overlap || p2_overlap || p3_overlap || p4_overlap || mp1_overlap || mp2_overlap || mp3_overlap || mp4_overlap;

    // If any point has overlap, return true
    return all_overlap; 
}

// Check overlap of all squares in an array
function checkOverlap(squares : Square[]) : Boolean{
    //Compare every square with every other square to see if any have overlap
    //I did try to do this recursively and it didn't work :(
    for(var i = 0; i < squares.length; i++){
        var s1 = squares[i];
            for (var j = 0; j < squares.length; j++){
                if (j != i){
                    var s2 = squares[j];
                    if (overlap(s1, s2)){
                        // Debugging logs: 
                        // console.log("Overlap Detected");
                        // console.log(s1);
                        // console.log(s2);   
                        return true;
                    } 
                }
            }
    }
    return false;
}

function findBorders(squares : Square[]) {
    var max_x = 0;
    var min_x = 0;
    var max_y = 0;
    var min_y = 0;
    for (var i = 0; i < squares.length; i++){
        var sqr = squares[i];
        max_x = (sqr.x + sqr.width) > max_x ? (sqr.x + sqr.width) : max_x;
        min_x = sqr.x < min_x ? sqr.x : min_x;

        min_y = sqr.y < min_y ? sqr.y : min_y; 
        max_y = (sqr.y + sqr.height) > max_y ? (sqr.y + sqr.height) : max_y;
    }
    var full_width = max_x - min_x;
    var full_height = max_y - min_y;
    var axis = full_height > full_width ? 1 : 0;

    return {
        height: full_height,
        width: full_width,
        top_left: [min_x, min_y],
        bot_right: [max_x, max_y],
        axis: axis
    }
}

function convertToPercent(squares : Square[], len : number) {
    for(var i = 0; i < squares.length; i++){
        squares[i].x = squares[i].x / len;
        squares[i].y = squares[i].y / len;
        squares[i].width = squares[i].width / len;
        squares[i].height = squares[i].height / len;
    }    
    return squares;
}

// Generate, arrange, combine, and check overlap for a full arrangment of squares
export function generateFullArrangement(scale : number, min_squares : number, max_squares : number, offset_min : number, offset_max : number) {
    var indv_min = min_squares / 2;
    var indv_max = (max_squares / 2) - indv_min;
    // Generate 2 arrangments to be combined
    var arr_A = genSquares(1, 25, Math.floor(Math.random() * indv_max + indv_min));
    var arr_B = genSquares(1, 20, Math.floor(Math.random() * indv_max + indv_min));
    
    // If either arrangment has overlap, regenerate it
    while (checkOverlap(arr_A.squares)){
        arr_A = genSquares(1, 25, Math.floor(Math.random() * indv_max + indv_min));
    }
    while (checkOverlap(arr_B.squares)){
        arr_B = genSquares(1, 20, Math.floor(Math.random() * indv_max + indv_min));  
    }

    // Generate offset
    var pos = genPositions(arr_A.longestEdge.length * offset_max, arr_A.longestEdge.length * offset_min);
    var axis = pos[0];
    var offset = pos[1];
    
    // Mirror the second arrangement along it's longest axis
    arr_B.squares = mirror(arr_B.squares, arr_A.longestEdge.axis, arr_A.point);

    // If the axis chosen differs from the current longest axis, rotate each arrangement
    if(axis != arr_A.longestEdge.axis){
        arr_A.squares = rotate(arr_A.squares);
        arr_B.squares = rotate(arr_B.squares);
    }

    var new_x = axis == 0 ? offset : 0;
    var new_y = axis == 1 ? offset : 0;
    // Shift arrangement B to be flush with arrangement A
    var trans_squares = shiftOrigin(arr_B.squares, new_x, new_y);
    var full_arr = arr_A.squares.concat(trans_squares); // The full arrangement

    // If the full arrangement has overlap, regenerate it until it doesn't
   
    if (checkOverlap(full_arr)){
        return generateFullArrangement(scale, min_squares, max_squares, offset_min, offset_max);
    } else {
        var borders = findBorders(full_arr);
        var side_len = borders.height > borders.width ? borders.height : borders.width;
        var diff_len = Math.abs(borders.height - borders.width);
        // Shift the arrangement so it is flush with the top left corner
        full_arr = shiftOrigin(full_arr, -borders.top_left[0], -borders.top_left[1]);

        // Shift arrangment to be centered on shortest axis
        if(borders.axis == 0){ // x-axis has the longest border
            full_arr = shiftOrigin(full_arr, 0, diff_len/2);
        } else {
            full_arr = shiftOrigin(full_arr, diff_len/2, 0);
        }

        // Convert the centered arrangment to percent
        full_arr = convertToPercent(full_arr, side_len);
        
        return full_arr; 
    }
}
