export const ORB_VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

export const ORB_FRAG = `
  precision highp float;
  uniform vec2 uRes; uniform float uT; uniform vec3 uCol; uniform float uAmp; uniform float uScale;
  vec3 hash3(vec3 p){p=vec3(dot(p,vec3(127.1,311.7,74.7)),dot(p,vec3(269.5,183.3,246.1)),dot(p,vec3(113.5,271.9,124.6)));return -1.+2.*fract(sin(p)*43758.5453);}
  float noise(vec3 p){vec3 i=floor(p),f=fract(p);vec3 u=f*f*(3.-2.*f);
    return mix(mix(mix(dot(hash3(i+vec3(0,0,0)),f-vec3(0,0,0)),dot(hash3(i+vec3(1,0,0)),f-vec3(1,0,0)),u.x),
                   mix(dot(hash3(i+vec3(0,1,0)),f-vec3(0,1,0)),dot(hash3(i+vec3(1,1,0)),f-vec3(1,1,0)),u.x),u.y),
               mix(mix(dot(hash3(i+vec3(0,0,1)),f-vec3(0,0,1)),dot(hash3(i+vec3(1,0,1)),f-vec3(1,0,1)),u.x),
                   mix(dot(hash3(i+vec3(0,1,1)),f-vec3(0,1,1)),dot(hash3(i+vec3(1,1,1)),f-vec3(1,1,1)),u.x),u.y),u.z);}
  float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.02;a*=.5;}return v;}
  void main(){
    vec2 uv=(gl_FragCoord.xy-.5*uRes)/min(uRes.x,uRes.y);
    float r=length(uv);
    float base=0.34*uScale;
    vec3 q=vec3(uv*3.2, uT*0.25);
    float n=fbm(q + fbm(q+uT*0.15)*0.6);
    float displace=n*(0.06+uAmp*0.10);
    float edge=base+displace;
    float body=smoothstep(edge, edge-0.14, r);
    float core=smoothstep(edge*0.9,0.0,r);
    float rim=smoothstep(edge, edge-0.05, r)-smoothstep(edge-0.05, edge-0.16, r);
    float bloom=smoothstep(edge+0.42, edge, r)*0.5;
    vec3 col=uCol;
    float lum=0.10 + core*(0.6+uAmp*0.8) + rim*1.4 + n*0.15;
    vec3 outc = col*lum*body + col*bloom*(0.5+uAmp*0.7) + col*rim*1.2;
    outc += vec3(0.02)*core;
    float alpha = max(body, bloom);
    gl_FragColor=vec4(outc, alpha);
  }`;
