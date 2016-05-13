uniform mat4 iModelToWorldMatrix;
uniform float iTime; 

uniform vec3 iCol0[3]; 
uniform vec3 iCol1[3]; 
uniform vec3 iCol2[3]; 
uniform vec3 iCol3[3]; 
uniform vec3 iCol4[3]; 
uniform vec3 iCol5[3]; 

/*varying vec2 vUv;*/
varying float vLightIntensity; 
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vECpos;

const vec3 LightPos = vec3(0., 10., 10.);

mat4 getMq(vec4 q) {
  return mat4(
    1. - 2.*(q.y*q.y + q.z*q.z), 2.*(q.x*q.y - q.w*q.z), 2.*(q.x*q.z + q.w*q.y), 0,
    2.*(q.x*q.y + q.w*q.z), 1. - 2.*(q.x*q.x + q.z*q.z), 2.*(q.y*q.z - q.w*q.x), 0,
    2.*(q.x*q.z - q.w*q.y), 2.*(q.y*q.z + q.w*q.x), 1. - 2.*(q.x*q.x + q.y*q.y), 0,
    0, 0, 0, 1.    
  );
}

// Bernstein polynomials
vec3 interpCol(vec3 col[3], float t) {
  return (1. - t)*(1. - t)*col[0] + 
    2.*(1. - t)*t*col[1] + 
    t*t*col[2];   
}

vec3 interpRow(vec3 row[6], float t) {
  return pow(1. - t, 5.)*row[0] +
    5.*pow(1. - t, 4.)*t*row[1] +
    10.*pow(1. - t, 3.)*pow(t, 2.)*row[2] +
    10.*pow(1. - t, 2.)*pow(t, 3.)*row[3] +
    5.*pow(t, 4.)*(1. - t)*row[4] +
    pow(t, 5.)*row[5];
}

void main() {
  /*vUv = uv;*/
  vNormal = normalize(normalMatrix * position);
  vECpos = (viewMatrix * 
            iModelToWorldMatrix * 
            vec4(position, 1.)).xyz;

  vec4 q = vec4(sin(iTime/2.)*vec3(0, 1., 0), cos(iTime/2.));

  // bunch of animations

  vec3 curveAtU[6];
  curveAtU[0] = interpCol(iCol0, uv.x);
  curveAtU[1] = interpCol(iCol1, uv.x);
  curveAtU[2] = interpCol(iCol2, uv.x);
  curveAtU[3] = interpCol(iCol3, uv.x);
  curveAtU[4] = interpCol(iCol4, uv.x);
  curveAtU[5] = interpCol(iCol5, uv.x);

  vec3 p = interpRow(curveAtU, uv.y);

  // this one's cool too
  float t = iTime*position.y;

  /*vec3 p = vec3(*/
      /*position.x + 0.5*cos(t), */
      /*position.y, */
      /*position.z + 0.5*sin(t)*/
  /*);*/

  gl_Position = projectionMatrix *
                viewMatrix * 
                iModelToWorldMatrix *
                vec4(p, 1.0);
                /*vec4(position, 1.0);*/
}
