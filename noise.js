/*
 * A speed-optimized perlin noise implementation in JavaScript.
 *
 * Based on the reference implementation by Ken Perlin (http://mrl.nyu.edu/~perlin/noise/).
 * Ported from Java to JavaScript by jx. (https://github.com/josephg/noisejs)
 */

(function(exports){

  var ClassicalNoise = function(r) { // Linear Congruential Generator
    if (r == undefined) r = Math;
    this.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
    this.p = [];
    for (var i=0; i<256; i++) {
      this.p[i] = Math.floor(r.random()*256);
    }
    // To remove the need for index wrapping, double the permutation table length
    this.perm = [];
    for (var i=0; i<512; i++) {
      this.perm[i] = this.p[i & 255];
    }
  };
  
  ClassicalNoise.prototype.dot = function(g, x, y, z) { 
    return g[0]*x + g[1]*y + g[2]*z; 
  };
  
  ClassicalNoise.prototype.mix = function(a, b, t) { 
    return (1.0-t)*a + t*b; 
  };

  ClassicalNoise.prototype.fade = function(t) { 
    return t*t*t*(t*(t*6.0-15.0)+10.0); 
  };

  // Classic Perlin noise, 3D input
  ClassicalNoise.prototype.noise = function(x, y, z) {
    // Find unit grid cell containing point
    var X = Math.floor(x);
    var Y = Math.floor(y);
    var Z = Math.floor(z);
    
    // Get relative xyz coordinates of point within that cell
    x = x - X;
    y = y - Y;
        z = z - Z;
    
    // Wrap the grid to 255 (to allow valid index for .perm())
    X = X & 255;
    Y = Y & 255;
    Z = Z & 255;
    
    // Calculate a set of eight hashed gradient indices
    var gi000 = this.perm[X+this.perm[Y+this.perm[Z]]];
    var gi001 = this.perm[X+this.perm[Y+this.perm[Z+1]]];
    var gi010 = this.perm[X+this.perm[Y+1+this.perm[Z]]];
    var gi011 = this.perm[X+this.perm[Y+1+this.perm[Z+1]]];
    var gi100 = this.perm[X+1+this.perm[Y+this.perm[Z]]];
    var gi101 = this.perm[X+1+this.perm[Y+this.perm[Z+1]]];
    var gi110 = this.perm[X+1+this.perm[Y+1+this.perm[Z]]];
    var gi111 = this.perm[X+1+this.perm[Y+1+this.perm[Z+1]]];
    
    // Calculate noise contributions from each of the eight corners
    var n000 = this.dot(this.grad3[gi000 % 12], x, y, z);
    var n001 = this.dot(this.grad3[gi001 % 12], x, y, z-1);
    var n010 = this.dot(this.grad3[gi010 % 12], x, y-1, z);
    var n011 = this.dot(this.grad3[gi011 % 12], x, y-1, z-1);
    var n100 = this.dot(this.grad3[gi100 % 12], x-1, y, z);
    var n101 = this.dot(this.grad3[gi101 % 12], x-1, y, z-1);
    var n110 = this.dot(this.grad3[gi110 % 12], x-1, y-1, z);
    var n111 = this.dot(this.grad3[gi111 % 12], x-1, y-1, z-1);
    
    // Compute the fade curve value for each of x, y, z
    var u = this.fade(x);
    var v = this.fade(y);
    var w = this.fade(z);
    
    // Interpolate along x the contributions from each of the corners
    var nx00 = this.mix(n000, n100, u);
    var nx01 = this.mix(n001, n101, u);
    var nx10 = this.mix(n010, n110, u);
    var nx11 = this.mix(n011, n111, u);
    
    // Interpolate the four results along y
    var nxy0 = this.mix(nx00, nx10, v);
    var nxy1 = this.mix(nx01, nx11, v);
    
    // Interpolate the two results along z
    var nxyz = this.mix(nxy0, nxy1, w);

    return nxyz;
  };

  exports.ClassicalNoise = ClassicalNoise;
  exports.noise = new ClassicalNoise(Math);

})(this);