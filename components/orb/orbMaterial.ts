/* Noise runs per-vertex here, not per-pixel. An icosahedron at detail 5 is
   ~10k vertices, so the displacement costs ~10k noise evaluations a frame
   instead of one per pixel across the whole canvas. */

import * as THREE from "three";
import { ORB_STATES } from "./orbStates";

/* Single source of truth for the uniform set, so a shader can never declare a
   uniform the material does not supply. */
export function createOrbUniforms() {
  return {
    uTime: { value: 0 },
    uAmp: { value: ORB_STATES.idle.amp },
    uScale: { value: 1 },
    uColor: { value: new THREE.Color(...ORB_STATES.idle.col) },
  };
}

/* Uniform names the GLSL is allowed to declare beyond three.js built-ins. */
export function declaredUniforms(source: string): string[] {
  return [...source.matchAll(/^\s*uniform\s+\w+\s+(\w+)\s*;/gm)].map((m) => m[1]);
}

const SIMPLEX_NOISE = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(
      i.z+vec4(0.0,i1.z,i2.z,1.0))
    + i.y+vec4(0.0,i1.y,i2.y,1.0))
    + i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

export const ORB_VERTEX = `
uniform float uTime;
uniform float uAmp;
uniform float uScale;
varying float vDisp;
varying vec3 vNormal;
varying vec3 vView;
${SIMPLEX_NOISE}
void main(){
  vec3 pos = position;
  float slow = snoise(pos * 1.5 + vec3(0.0, 0.0, uTime * 0.22));
  float fine = snoise(pos * 3.6 + vec3(uTime * 0.16, 0.0, 0.0));
  float disp = slow * (0.10 + uAmp * 0.26) + fine * (0.03 + uAmp * 0.09);
  vDisp = disp;
  vec3 displaced = pos * uScale + normal * disp;
  vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
  vView = -mv.xyz;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * mv;
}`;

export const ORB_FRAGMENT = `
precision mediump float;
uniform vec3 uColor;
uniform float uAmp;
varying float vDisp;
varying vec3 vNormal;
varying vec3 vView;
void main(){
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.4);
  float core = 0.16 + vDisp * 0.9;
  vec3 col = uColor * (core + fres * 1.7) + uColor * uAmp * 0.30;
  float alpha = clamp(fres * 1.25 + 0.30, 0.0, 1.0);
  gl_FragColor = vec4(col, alpha);
}`;
