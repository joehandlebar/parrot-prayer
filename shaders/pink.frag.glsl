uniform float iTime; 

/*varying vec2 vUv;*/
varying float vLightIntensity; 
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vECpos;

#define TEXEL_SIZE 1.0/512.0 
#define PI 3.14159265359 

const vec3 LightPos = vec3(0., 10., 10.);
const vec3 AmbientMaterial = vec3(1., 0, 0.);
const vec3 DiffuseMaterial = vec3(0.5, 0, 1.);
const vec3 SpecularMaterial = vec3(1., 1., 1.);

vec3 getADC() {
  // ambient
  vec3 A = AmbientMaterial * vec3(0.5);

  // diffuse 
  vec3 N = vNormal; // convenience normal
  vec3 L = normalize(LightPos - vECpos); 
  float intensity = max(0., dot(L, N));
  vec3 D = DiffuseMaterial * intensity; 

  // specular 
  vec3 R = 2.*dot(N, L)*N - L; // reflection vector
  vec3 E = normalize(cameraPosition - vECpos); // eye vector
  vec3 H = normalize(L + E); // half-angle vector
  /*float shine = pow(max(0., dot(R, E)), 20.); */
  float shine = pow(max(0., dot(N, H)), 20.); 
  vec3 S = SpecularMaterial * shine; 

  return clamp(A + D + S, vec3(0), vec3(1.)); 
}

void main() {
  gl_FragColor.rgb = getADC();

  gl_FragColor.a = 1.0;
}
