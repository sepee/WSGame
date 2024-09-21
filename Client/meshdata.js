const circleVertices = [0, 1, 0.71, 0.71, 1, 0, 0.71, -0.71, 0, -1, -0.71, -0.71, -1, 0, -0.71, 0.71, 0, 1];
const circleIndices = [0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,0];

const squareVertices = [1,1,1,-1,-1,-1,-1,1];
const squareIndices = [0,1,1,2,2,3,3,0];

// vertices of quad to be drawn using gl.TRIANGLE_STRIP
const quadVerticesTS = [0,0,0,1,1,0,1,1];
const quadIndicesTS = [0,1,2,3];

// vertices of quad to be drawn using gl.TRIANGLE
const quadVerticesT = [0,0, 0,1, 1,0, 1,1];
const quadIndicesT = [0,1,3,0,3,2];

const cubeVertices = [
//  x, y, z,  nx,ny,nz
    0.5, -0.5, -0.5,   1, 0, 0, // right
    0.5, -0.5,  0.5,   1, 0, 0,
    0.5,  0.5, -0.5,   1, 0, 0,
    0.5,  0.5,  0.5,   1, 0, 0,

    -0.5, -0.5, -0.5,  -1, 0, 0, // left
    -0.5, -0.5,  0.5,  -1, 0, 0,
    -0.5,  0.5, -0.5,  -1, 0, 0,
    -0.5,  0.5,  0.5,  -1, 0, 0,

    -0.5,  0.5, -0.5,   0, 1, 0, // top
    -0.5,  0.5,  0.5,   0, 1, 0,
     0.5,  0.5, -0.5,   0, 1, 0,
     0.5,  0.5,  0.5,   0, 1, 0,

    -0.5, -0.5, -0.5,  0, -1, 0, // bottom
    -0.5, -0.5,  0.5,  0, -1, 0,
     0.5, -0.5, -0.5,  0, -1, 0,
     0.5, -0.5,  0.5,  0, -1, 0,

    -0.5, -0.5,  0.5,  0, 0, 1, // front
    -0.5,  0.5,  0.5,  0, 0, 1,
     0.5, -0.5,  0.5,  0, 0, 1,
     0.5,  0.5,  0.5,  0, 0, 1,

    -0.5, -0.5, -0.5,  0, 0, -1, // back
    -0.5,  0.5, -0.5,  0, 0, -1,
     0.5, -0.5, -0.5,  0, 0, -1,
     0.5,  0.5, -0.5,  0, 0, -1
];

const cubeIndices = [
    0,1,3, 0,3,2,
    4,7,5, 4,6,7,
    8,11,9, 8,10,11,
    12,13,15, 12,15,14,
    16,17,19, 16,19,18,
    20,23,21, 20,22,23
];

function GenerateTerrain(sizeX, sizeY)
{    
    verts = [];
    tris = [];

    // Generate verts
    for(let y = 0; y < sizeY; y++)
        for(let x = 0; x < sizeX; x++)
        {
            var vertStartIdx = (y * sizeX + x) * 6
        
            //position
            verts[vertStartIdx    ] = x;
            verts[vertStartIdx + 1] = Math.sin(x/5) * Math.sin(y/5) + Math.sin(x/17) * 3 + Math.sin(y/18) * 3;
            verts[vertStartIdx + 2] = y;

            //normal
            verts[vertStartIdx + 3] = Math.cos(x/2);
            verts[vertStartIdx + 4] = 0.5;
            verts[vertStartIdx + 5] = Math.cos(y/2);
        }

    // Generate tris
    for(let y = 0; y < sizeY - 1; y++)
        for(let x = 0; x < sizeX - 1; x++)
        {
            var vertStartIdx = (y * sizeX + x)
            var triStartIdx = (y * (sizeX - 1) + x) * 6
           
            //tri 1
            tris[triStartIdx    ] = vertStartIdx;
            tris[triStartIdx + 1] = vertStartIdx + 1;
            tris[triStartIdx + 2] = vertStartIdx + sizeX + 1;
    
            //tri 2
            tris[triStartIdx + 3] = vertStartIdx;
            tris[triStartIdx + 4] = vertStartIdx + sizeX + 1;
            tris[triStartIdx + 5] = vertStartIdx + sizeX;
        }

    return [verts, tris]
}

TerrainMeshData = GenerateTerrain(100, 100);

